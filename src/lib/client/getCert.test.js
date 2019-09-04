/* global jest test expect beforeEach */

const getCert = require('./getCert')
const requestCert = require('../requestCert')
const httpRedirect = require('../httpRedirect')
const config = require('../../config')
const obtainCert = require('./obtainCert')

jest.mock('getopts')
jest.mock('../requestCert')
jest.mock('../httpRedirect')
jest.mock('./obtainCert')

let mockOpts
let mockResponse
const mockConfig = {
  certcacheHost: 'bar.com',
  certcachePort: 54321
}

for (const i in mockConfig) {
  config[i] = mockConfig[i]
}

requestCert.mockImplementation(() => {
  return Promise.resolve(JSON.stringify(mockResponse))
})

console.error = jest.fn()
console.log = jest.fn()

beforeEach(() => {
  mockResponse = { success: true, data: { bundle: 'foobar54321' } }
  mockOpts = {
    'cert-name': 'test-cert-name',
    domains: 'example.com,test.example.com,foo.example.com',
    host: 'example.com',
    port: 12345,
    'test-cert': true
  }
  requestCert.mockClear()
  console.error.mockClear()
  console.log.mockClear()
  httpRedirect.start.mockClear()
  httpRedirect.stop.mockClear()
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    const mockDomainsArr = mockOpts.domains.split(',')

    await getCert(mockOpts)

    expect(obtainCert).toBeCalledWith(
      mockOpts.host,
      mockOpts.port,
      mockDomainsArr[0],
      mockDomainsArr.slice(1),
      mockOpts['test-cert'],
      `${config.certcacheCertDir}/${mockOpts['cert-name']}`
    )
  }
)

test(
  'should request certs using config when no command-line args provided',
  async () => {
    mockOpts = {
      domains: 'example.com,test.bar.com,foo.bar.com',
      'test-cert': false
    }

    await getCert(mockOpts)

    const mockDomainsArr = mockOpts.domains.split(',')
    const [commonName, ...altNames] = mockDomainsArr

    await getCert(mockOpts)

    expect(obtainCert).toBeCalledWith(
      mockConfig.certcacheHost,
      mockConfig.certcachePort,
      commonName,
      altNames,
      mockOpts['test-cert'],
      `${config.certcacheCertDir}/${commonName}`
    )
  }
)

test(
  'should start an http proxy when requested',
  async () => {
    mockOpts['http-redirect-url'] = 'https://certcache.example.com'

    await getCert(mockOpts)

    expect(httpRedirect.start).toBeCalledWith(mockOpts['http-redirect-url'])
    expect(httpRedirect.stop).toBeCalled()
  }
)

test(
  'should write cert bundle to filesystem when received from certcache server',
  async () => {
    await getCert(mockOpts)

    const mockDomainsArr = mockOpts.domains.split(',')

    expect(obtainCert)
      .toBeCalledWith(
        mockOpts.host,
        mockOpts.port,
        mockDomainsArr[0],
        mockDomainsArr.slice(1),
        mockOpts['test-cert'],
        `${config.certcacheCertDir}/${mockOpts['cert-name']}`
      )
  }
)
