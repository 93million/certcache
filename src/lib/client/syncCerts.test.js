/* global jest test expect beforeEach */

const syncCerts = require('./syncCerts')
const getopts = require('getopts')
const getLocalCertificates = require('../getLocalCertificates')
const config = require('../../config')
const httpRedirect = require('../httpRedirect')
const getDomainsFromConfig = require('./getDomainsFromConfig')
const obtainCert = require('./obtainCert')
const yaml = require('yaml')
const path = require('path')

jest.mock('getopts')
jest.mock('../httpRedirect')
jest.mock('../getLocalCertificates')
jest.mock('./getDomainsFromConfig')
jest.mock('./obtainCert')

let mockOpts
const certcacheCertDir = '/test/certcache/certs'
const mockConfig = {
  certcacheHost: 'certcache.example.com',
  certcachePort: 54321,
  certcacheCertDir
}

for (const i in mockConfig) {
  config[i] = mockConfig[i]
}

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
const mockCertcacheDomains = [
  {
    cert_name: 'mail',
    domains: ['mail.mcelderry.com'],
    is_test: true
  },
  {
    cert_name: 'web',
    domains: [
      'mcelderry.com',
      'gitlab.mcelderry.com',
      'switchd.mcelderry.com',
      'webmail.mcelderry.com',
      'www.mcelderry.com',
      'foo.boo.coo'
    ]
  }
]

console.log = jest.fn()

getDomainsFromConfig.mockReturnValue(mockCertcacheDomains)

getopts.mockImplementation(() => {
  return mockOpts
})
getLocalCertificates.mockReturnValue(mockLocalCerts)

beforeEach(() => {
  console.log.mockClear()
  mockOpts = {
    host: 'example.com',
    port: 12345,
    days: 30
  }

  httpRedirect.start.mockClear()
  httpRedirect.stop.mockClear()

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + mockOpts.days)

  mockCertsForRenewal = mockLocalCerts
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))

  delete process.env.CERTCACHE_DOMAINS
  getDomainsFromConfig.mockClear()
  obtainCert.mockClear()
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        mockOpts.host,
        mockOpts.port,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        (mockLocalCert.issuerCommonName.indexOf('Fake') !== -1),
        path.dirname(mockLocalCert.certPath)
      )
    })
  }
)

test(
  'should request certs using config when no command-line args provided',
  async () => {
    mockOpts = { days: 30 }

    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        mockConfig.certcacheHost,
        mockConfig.certcachePort,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        (mockLocalCert.issuerCommonName.indexOf('Fake') !== -1),
        path.dirname(mockLocalCert.certPath)
      )
    })
  }
)

test(
  'should start an http proxy when requested',
  async () => {
    const httpRedirectUrl = 'https://certcache.example.com'

    mockOpts = { 'http-redirect-url': httpRedirectUrl, days: 30 }
    await syncCerts()

    expect(httpRedirect.start).toBeCalledWith(httpRedirectUrl)
    expect(httpRedirect.stop).toBeCalledTimes(1)
  }
)

test(
  'should parse domains passed in environment variable \'CERTCACHE_DOMAINS\'',
  async () => {
    process.env.CERTCACHE_DOMAINS = yaml.stringify(mockCertcacheDomains)

    await syncCerts()

    expect(getDomainsFromConfig)
      .toBeCalledWith(mockCertcacheDomains)
  }
)
