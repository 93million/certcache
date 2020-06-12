/* global jest beforeEach test expect */

const obtainCert = require('./obtainCert')
const request = require('../request')
const writeBundle = require('../writeBundle')
const getConfig = require('../getConfig')

jest.mock('../request')
jest.mock('../writeBundle')
jest.mock('../getConfig')

console.error = jest.fn()
console.log = jest.fn()

let mockResponse

request.mockImplementation(() => {
  const p = Promise.resolve(mockResponse)

  p.destroy = jest.fn()

  return p
})

const mockHost = 'certcache.example.com'
const mockPort = 54321
const mockCommonName = 'example.com'
const mockAltNames = ['test.example.com', 'foo.example.com']
const mockMeta = { isTest: true }
const mockCertDirPath = '/test/path/certs/example.com'
const mockCahKeysDir = '/test/path/cahkeys'

beforeEach(() => {
  mockResponse = { success: true, data: { bundle: 'foobar54321' } }
})

test(
  'should request certs using args provided',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    )

    expect(request).toBeCalledWith(
      { cahKeysDir: mockCahKeysDir, host: mockHost, port: mockPort },
      expect.any(String),
      { domains: [mockCommonName, ...mockAltNames], meta: mockMeta }
    )
  }
)

test(
  'should write cert bundle to filesystem when received from certcache server',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    )

    expect(writeBundle).toBeCalledWith(
      mockCertDirPath,
      mockResponse.data.bundle
    )
  }
)

test(
  'should throw an error when failing to get cert from certcache server',
  async () => {
    mockResponse = { success: false }

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    ))
      .rejects
      .toThrow()
  }
)

test(
  'should throw an error containing messages retrieved from certcache server',
  async () => {
    const error = '__test error__'

    mockResponse = { success: false, error }

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    ))
      .rejects
      .toThrow(error)
  }
)

test(
  'should output information about certs retrieved from certcache server',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    )

    expect(console.log.mock.calls.map((args) => (args.join(' '))).join(' '))
      .toContain(mockCommonName)
  }
)

test(
  'should handle being invoked with undefined altNames',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      undefined,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    )

    expect(request).toBeCalledWith(
      { cahKeysDir: mockCahKeysDir, host: mockHost, port: mockPort },
      expect.any(String),
      { domains: [mockCommonName], meta: mockMeta }
    )
  }
)

test(
  'should throw an error if time taken is longer than maxRequestTime',
  async () => {
    const config = await getConfig()
    getConfig.mockReturnValueOnce(Promise.resolve({
      ...config,
      maxRequestTime: 0
    }))

    request.mockImplementationOnce(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 100) })

      return mockResponse
    })

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      undefined,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    ))
      .rejects
      .toThrow('obtainCert() took more than')
  }
)

test(
  'should repeat requests for certificates until it receives a valid response',
  async () => {
    const config = await getConfig()
    getConfig.mockReturnValueOnce(Promise.resolve({
      ...config,
      httpRequestInterval: 0
    }))

    const destroy = jest.fn()

    request.mockImplementationOnce(() => {
      const p = new Promise((resolve) => {
        setTimeout(() => { resolve(mockResponse) }, 100)
      })

      p.destroy = destroy

      return p
    })

    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      undefined,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    )

    expect(request).toBeCalledTimes(2)
    expect(destroy).toBeCalledTimes(1)
  }
)

test(
  'should throw request errors that are not REQUEST_DESTROYED',
  async () => {
    request.mockImplementationOnce(
      () => new Promise((resolve, reject) => {
        reject(new Error('HOPPLA!'))
      })
    )

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      undefined,
      mockMeta,
      mockCertDirPath,
      { cahKeysDir: mockCahKeysDir }
    ))
      .rejects
      .toThrow('HOPPLA!')
  }
)
