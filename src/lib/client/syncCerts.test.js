/* global jest test expect beforeEach */

const syncCerts = require('./syncCerts')
const getopts = require('getopts')
const requestCert = require('../requestCert')
const getLocalCertificates = require('../getLocalCertificates')
const config = require('../../config')
const httpRedirect = require('../httpRedirect')
const writeBundle = require('../writeBundle')
const path = require('path')

jest.mock('getopts')
jest.mock('../requestCert')
jest.mock('../httpRedirect')
jest.mock('../getLocalCertificates')
jest.mock('../writeBundle')

let mockOpts
let mockResponse
const certcacheCertDir = '/test/certcache/certs'
const mockConfig = {
  certcacheHost: 'bar.com',
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
let mockCertsForRenewal

getopts.mockImplementation(() => {
  return mockOpts
})
requestCert.mockImplementation(() => {
  return Promise.resolve(JSON.stringify(mockResponse))
})
getLocalCertificates.mockReturnValue(mockLocalCerts)

console.error = jest.fn()
console.log = jest.fn()

beforeEach(() => {
  mockResponse = { success: true, data: { bundle: 'foobar54321' } }
  mockOpts = {
    host: 'example.com',
    port: 12345,
    days: 30
  }
  requestCert.mockClear()
  console.error.mockClear()
  console.log.mockClear()
  httpRedirect.start.mockClear()
  httpRedirect.stop.mockClear()

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + mockOpts.days)

  mockCertsForRenewal = mockLocalCerts
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(requestCert).toBeCalledWith(
        { host: mockOpts.host, port: mockOpts.port },
        [mockLocalCert.commonName, ...mockLocalCert.altNames],
        mockLocalCert.issuerCommonName.indexOf('Fake') !== -1
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
      expect(requestCert).toBeCalledWith(
        { host: mockConfig.certcacheHost, port: mockConfig.certcachePort },
        [mockLocalCert.commonName, ...mockLocalCert.altNames],
        mockLocalCert.issuerCommonName.indexOf('Fake') !== -1
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
  'should write cert bundle to filesystem when received from certcache server',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockCert) => {
      expect(writeBundle)
        .toBeCalledWith(
          path.dirname(mockCert.certPath),
          mockResponse.data.bundle
        )
    })
  }
)

test(
  'should output a warning if cert fails to be retrieved from certcache server',
  async () => {
    mockResponse = { success: false }

    await syncCerts()

    expect(console.error).toBeCalledTimes(mockCertsForRenewal.length)
  }
)

test(
  'should output any error messages retrieved from certcache server',
  async () => {
    const error = '__test error__'

    mockResponse = { success: false, error }

    await syncCerts()

    expect(console.error.mock.calls[0][0]).toContain(error)
  }
)
