const getCert = require('./getCert')
const getopts = require('getopts')
const requestCert = require('../requestCert')
const httpRedirect = require('../httpRedirect')
const config = require('../../config')
const writeBundle = require('../writeBundle')

jest.mock('getopts')
jest.mock('../requestCert')
jest.mock('../httpRedirect')
jest.mock('../writeBundle')

let mockOpts
let mockResponse
const mockConfig = {
  certcacheHost: 'bar.com',
  certcachePort: 54321
}

for (let i in mockConfig) {
  config[i] = mockConfig[i]
}

getopts.mockImplementation(() => {
  return mockOpts
})
requestCert.mockImplementation(() => {
  return Promise.resolve(JSON.stringify(mockResponse))
})

console.error = jest.fn()
console.log = jest.fn()

beforeEach(() => {
  mockResponse = {success: true, data: {bundle: 'foobar54321'}}
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
})

test(
  'should get opts from command line when provided as args',
  async () => {
    await getCert()

    expect(requestCert).toBeCalledWith(
      {host: mockOpts.host, port: mockOpts.port},
      mockOpts.domains.split(','),
      mockOpts['test-cert']
    )
  }
)

test(
  'should get opts from config when not provided as args',
  async () => {
    mockOpts = {
      domains: 'example.com,test.bar.com,foo.bar.com',
      'test-cert': false
    }

    await getCert()

    expect(requestCert).toBeCalledWith(
      {host: mockConfig.certcacheHost, port: mockConfig.certcachePort},
      mockOpts.domains.split(','),
      mockOpts['test-cert']
    )
  }
)

test(
  'should start an http proxy when requested',
  async () => {
    mockOpts['http-redirect-url'] = 'https://certcache.example.com'

    await getCert()

    expect(httpRedirect.start).toBeCalledWith(mockOpts['http-redirect-url'])
    expect(httpRedirect.stop).toBeCalled()
  }
)

test(
  'should write cert bundle to filesystem when received from certcache server',
  async () => {
    await getCert()

    expect(writeBundle)
      .toBeCalledWith(mockOpts['cert-name'], mockResponse.data.bundle)
  }
)

test(
  'should output a warning if cert fails to be retrieved from certcache server',
  async () => {
    mockResponse = {success: false}

    await getCert()

    expect(console.error).toBeCalledTimes(1)
  }
)

test(
  'should output any error messages retrieved from certcache server',
  async () => {
    const error = '__test error__'

    mockResponse = {success: false, error}

    await getCert()

    expect(console.error.mock.calls[0][0]).toContain(error)
  }
)

test(
  'should output usage when no domains are supplied',
  async () => {
    mockOpts = {
      'test-cert': false
    }

    await getCert()

    expect(console.log.mock.calls[0][0]).toContain('Usage: ')
  }
)
