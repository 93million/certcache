/* global jest test expect beforeEach */

const syncCerts = require('./syncCerts')
const getLocalCertificates = require('../getLocalCertificates')
const httpRedirect = require('../httpRedirect')
const getDomainsFromConfig = require('./getDomainsFromConfig')
const obtainCert = require('./obtainCert')
const yaml = require('yaml')
const path = require('path')
const getConfig = require('../getConfig')

jest.mock('../httpRedirect')
jest.mock('../getLocalCertificates')
jest.mock('./getDomainsFromConfig')
jest.mock('./obtainCert')
jest.mock('../getConfig')

let mockOpts
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
  console.log.mockClear()
  mockOpts = {
    host: 'example.com',
    port: 12345,
    cahkeys: '/path/to/cahkeys'
  }

  httpRedirect.start.mockClear()
  httpRedirect.stop.mockClear()

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + config.renewDays)

  mockCertsForRenewal = mockLocalCerts
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))

  delete process.env.CERTCACHE_DOMAINS
  getDomainsFromConfig.mockClear()
  obtainCert.mockClear()
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    await syncCerts(mockOpts)

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        mockOpts.host,
        mockOpts.port,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        mockLocalCert.issuerCommonName.startsWith('Fake'),
        path.dirname(mockLocalCert.certPath),
        { cahKeysDir: mockOpts.cahkeys }
      )
    })
  }
)

test(
  'should request certs using config when no command-line args provided',
  async () => {
    mockOpts = { }

    await syncCerts(mockOpts)

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        config.certcacheHost,
        config.certcachePort,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        mockLocalCert.issuerCommonName.startsWith('Fake'),
        path.dirname(mockLocalCert.certPath),
        { cahKeysDir: mockOpts.cahkeys }
      )
    })
  }
)

test(
  'should start an http proxy when requested',
  async () => {
    const httpRedirectUrl = 'https://certcache.example.com'

    getConfig.mockReturnValueOnce(Promise.resolve({
      ...config,
      client: {
        ...config.client,
        httpRedirectUrl
      }
    }))

    await syncCerts(mockOpts)

    expect(httpRedirect.start).toBeCalledWith(httpRedirectUrl)
    expect(httpRedirect.stop).toBeCalledTimes(1)
  }
)

test(
  'should parse domains passed in environment variable \'CERTCACHE_DOMAINS\'',
  async () => {
    const mockCertcacheDomains = { test: 'object' }

    getConfig.mockReturnValueOnce(Promise.resolve({
      ...config,
      client: {
        ...config.client,
        domains: mockCertcacheDomains
      }
    }))

    process.env.CERTCACHE_DOMAINS = yaml.stringify(mockCertcacheDomains)

    await syncCerts(mockOpts)

    expect(getDomainsFromConfig).toBeCalledWith(mockCertcacheDomains)
  }
)
