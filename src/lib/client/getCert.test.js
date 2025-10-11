/* global jest test expect beforeEach */

const path = require('path')
const getCert = require('./getCert')
const httpRedirect = require('../httpRedirect')
const obtainCert = require('./obtainCert')
const getConfig = (require('../getConfig'))
const canonicaliseUpstreamConfig = require('../canonicaliseUpstreamConfig')

jest.mock('../httpRedirect')
jest.mock('./obtainCert')
jest.mock('../getConfig')

let mockOpts
let mockConfig
const mockMeta = {
  certbot: { isTest: expect.any(Boolean), keyType: expect.any(String) }
}

console.error = jest.fn()
console.log = jest.fn()

beforeEach(async () => {
  mockOpts = {
    domains: 'example.com,test.example.com,foo.example.com',
    catkeys: '/argv/path/to/catkeys',
    'cert-name': 'testcert'
  }
  mockConfig = await getConfig()
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    const mockDomainsArr = mockOpts.domains.split(',')
    const { host, port } = canonicaliseUpstreamConfig(mockConfig.upstream)

    await getCert(mockOpts)

    expect(obtainCert).toHaveBeenCalledWith(
      host,
      port,
      mockDomainsArr[0],
      mockDomainsArr,
      mockMeta,
      path.resolve(mockConfig.certDir, mockOpts['cert-name']),
      {
        catKeysDir: mockConfig.catKeysDir,
        days: mockConfig.renewalDays
      }
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
    const commonName = mockDomainsArr[0]
    const altNames = mockDomainsArr
    const { host, port } = canonicaliseUpstreamConfig(mockConfig.upstream)

    await getCert(mockOpts)

    expect(obtainCert).toHaveBeenCalledWith(
      host,
      port,
      commonName,
      altNames,
      mockMeta,
      path.resolve(mockConfig.certDir, commonName),
      {
        catKeysDir: mockConfig.catKeysDir,
        days: mockConfig.renewalDays
      }
    )
  }
)

test(
  'should start an http redirect server when requested',
  async () => {
    const httpRedirectUrl = 'https://certcache.example.com'

    getConfig.mockReturnValueOnce({
      ...mockConfig,
      httpRedirectUrl
    })

    await getCert(mockOpts)

    expect(httpRedirect.start).toHaveBeenCalledWith(httpRedirectUrl)
    expect(httpRedirect.stop).toHaveBeenCalledWith()
  }
)

test(
  'should write cert bundle to filesystem when received from certcache server',
  async () => {
    await getCert(mockOpts)

    const mockDomainsArr = mockOpts.domains.split(',')
    const { host, port } = canonicaliseUpstreamConfig(mockConfig.upstream)

    expect(obtainCert)
      .toHaveBeenCalledWith(
        host,
        port,
        mockDomainsArr[0],
        mockDomainsArr,
        mockMeta,
        path.resolve(mockConfig.certDir, mockOpts['cert-name']),
        {
          catKeysDir: mockConfig.catKeysDir,
          days: mockConfig.renewalDays
        }
      )
  }
)
