/* global jest test expect beforeEach */

const path = require('path')
const getCert = require('./getCert')
const httpRedirect = require('../httpRedirect')
const obtainCert = require('./obtainCert')
const getConfig = (require('../getConfig'))

jest.mock('../httpRedirect')
jest.mock('./obtainCert')
jest.mock('../getConfig')

let mockOpts
let mockConfig
const mockMeta = { certbot: { isTest: expect.any(Boolean) } }

console.error = jest.fn()
console.log = jest.fn()

beforeEach(async () => {
  mockOpts = {
    domains: 'example.com,test.example.com,foo.example.com',
    cahkeys: '/path/to/cahkeys',
    'cert-name': 'testcert'
  }
  mockConfig = await getConfig()
  console.error.mockClear()
  console.log.mockClear()
  httpRedirect.start.mockClear()
  httpRedirect.stop.mockClear()
  obtainCert.mockClear()
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    const mockDomainsArr = mockOpts.domains.split(',')

    await getCert(mockOpts)

    expect(obtainCert).toBeCalledWith(
      mockConfig.client.host,
      mockConfig.client.port,
      mockDomainsArr[0],
      mockDomainsArr.slice(1),
      mockMeta,
      path.resolve(mockConfig.client.certDir, mockOpts['cert-name']),
      { cahKeysDir: mockOpts.cahkeys }
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
      mockConfig.client.host,
      mockConfig.client.port,
      commonName,
      altNames,
      mockMeta,
      path.resolve(mockConfig.client.certDir, commonName),
      { cahKeysDir: mockOpts.cahkeys }
    )
  }
)

test(
  'should start an http redirect server when requested',
  async () => {
    mockOpts['http-redirect-url'] = 'https://certcache.example.com'

    await getCert(mockOpts)

    expect(httpRedirect.start).toBeCalledWith(mockConfig.client.httpRedirectUrl)
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
        mockConfig.client.host,
        mockConfig.client.port,
        mockDomainsArr[0],
        mockDomainsArr.slice(1),
        mockMeta,
        path.resolve(mockConfig.client.certDir, mockOpts['cert-name']),
        { cahKeysDir: mockOpts.cahkeys }
      )
  }
)
