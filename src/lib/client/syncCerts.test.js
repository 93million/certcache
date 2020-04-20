/* global jest test expect beforeEach */

const syncCerts = require('./syncCerts')
const getLocalCertificates = require('../getLocalCertificates')
const httpRedirect = require('../httpRedirect')
const normaliseCertDefinitions = require('./normaliseCertDefinitions')
const obtainCert = require('./obtainCert')
const yaml = require('yaml')
const path = require('path')
const getConfig = require('../getConfig')

jest.mock('../httpRedirect')
jest.mock('../getLocalCertificates')
jest.mock('./normaliseCertDefinitions')
jest.mock('./obtainCert')
jest.mock('../getConfig')

let config
const certcacheCertDir = '/test/certcache/certs'

const generateMockCert = (tld, isTest = true, daysBeforeExpiry) => {
  const notAfter = new Date()

  notAfter.setDate(notAfter.getDate() + daysBeforeExpiry)

  return {
    commonName: tld,
    altNames: [tld, `www.${tld}`, `test.${tld}`],
    issuerCommonName: isTest
      ? 'Fake LE Intermediate X1'
      : 'Let\'s Encrypt Authority X3',
    notAfter,
    certPath: `${certcacheCertDir}/${tld}/cert.pem`
  }
}
const mockLocalCerts = [
  generateMockCert('example.com', true, 20),
  generateMockCert('93million.com', false, 10),
  generateMockCert('test.example.com', false, 50)
]
mockLocalCerts.findCert = jest.fn()
let mockCertsForRenewal

console.log = jest.fn()

getLocalCertificates.mockReturnValue(mockLocalCerts)

beforeEach(async () => {
  config = await getConfig()

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + config.renewDays)

  mockCertsForRenewal = mockLocalCerts
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))

  delete process.env.CERTCACHE_CERTS
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        config.host,
        config.port,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        { isTest: mockLocalCert.issuerCommonName.startsWith('Fake') },
        path.dirname(mockLocalCert.certPath),
        { cahKeysDir: config.cahkeys }
      )
    })
  }
)

test(
  'should request certs using config when no command-line args provided',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        config.certcacheHost,
        config.certcachePort,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        mockLocalCert.issuerCommonName.startsWith('Fake'),
        path.dirname(mockLocalCert.certPath),
        { cahKeysDir: config.cahkeys }
      )
    })
  }
)

test(
  'should start an http proxy when requested',
  async () => {
    const httpRedirectUrl = 'https://certcache.example.com'

    getConfig.mockReturnValueOnce(Promise.resolve({ ...config, httpRedirectUrl }))

    await syncCerts()

    expect(httpRedirect.start).toBeCalledWith(httpRedirectUrl)
    expect(httpRedirect.stop).toBeCalledTimes(1)
  }
)

test(
  'should parse domains passed in environment variable \'CERTCACHE_CERTS\'',
  async () => {
    const mockCertcacheCertDefinitions = { test: 'object' }

    getConfig.mockReturnValueOnce(Promise.resolve({
      ...config,
      certs: mockCertcacheCertDefinitions
    }))

    process.env.CERTCACHE_CERTS = yaml.stringify(mockCertcacheCertDefinitions)

    await syncCerts()

    expect(normaliseCertDefinitions)
      .toBeCalledWith(mockCertcacheCertDefinitions)
  }
)

test(
  'should throw an error comprising all errors encountered calling obtainCert()',
  async () => {
    const err1 = new Error('failed 1')
    const err2 = new Error('failed 2')

    obtainCert.mockImplementationOnce(() => {
      throw err1
    })

    obtainCert.mockImplementationOnce(() => {
      throw err2
    })

    await expect(syncCerts())
      .rejects
      .toThrow([err1.message, err2.message].join('\n'))
  }
)
