/* global jest test expect */

const obtainCert = require('./obtainCert')
const request = require('../request')
const writeBundle = require('../writeBundle')
const getConfig = require('../getConfig')
const getCert = require('../server/actions/getCert')
const execCommand = require('../execCommand')

jest.mock('../request')
jest.mock('../writeBundle')
jest.mock('../getConfig')
jest.mock('../server/actions/getCert')
jest.mock('../execCommand')

console.error = jest.fn()
console.log = jest.fn()

const mockResponse = { success: true, data: { bundle: 'foobar54321' } }

request.mockImplementation(() => {
  const p = Promise.resolve(mockResponse.data)

  p.destroy = jest.fn()

  return p
})

getCert.mockReturnValue(mockResponse.data)

const mockHost = 'certcache.example.com'
const mockPort = 54321
const mockCommonName = 'example.com'
const mockAltNames = ['test.example.com', 'foo.example.com']
const mockMeta = { isTest: true }
const mockCertDirPath = '/test/path/certs/example.com'
const mockCatKeysDir = '/test/path/catkeys'
const mockDays = 21

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
      { catKeysDir: mockCatKeysDir, days: mockDays }
    )

    expect(request).toBeCalledWith(
      { catKeysDir: mockCatKeysDir, host: mockHost, port: mockPort },
      expect.any(String),
      {
        domains: [mockCommonName, ...mockAltNames],
        meta: mockMeta,
        days: mockDays
      }
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
      { catKeysDir: mockCatKeysDir, days: mockDays }
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
    request.mockImplementationOnce(() => Promise.reject(new Error('foo')))

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { catKeysDir: mockCatKeysDir, days: mockDays }
    ))
      .rejects
      .toThrow(/^Error renewing certificate .* Message: 'foo'$/)
  }
)

test(
  'should throw an error containing messages retrieved from certcache server',
  async () => {
    const error = '__test error__'

    request.mockReturnValueOnce(Promise.reject(new Error(error)))

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { catKeysDir: mockCatKeysDir, days: mockDays }
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
      { catKeysDir: mockCatKeysDir, days: mockDays }
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
      { catKeysDir: mockCatKeysDir, days: mockDays }
    )

    expect(request).toBeCalledWith(
      { catKeysDir: mockCatKeysDir, host: mockHost, port: mockPort },
      expect.any(String),
      { domains: [mockCommonName], meta: mockMeta, days: mockDays }
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
      { catKeysDir: mockCatKeysDir }
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
      { catKeysDir: mockCatKeysDir }
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
      { catKeysDir: mockCatKeysDir }
    ))
      .rejects
      .toThrow('HOPPLA!')
  }
)
test(
  'should generate cert locally when when in autonomous mode',
  async () => {
    await obtainCert(
      '--internal',
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { catKeysDir: mockCatKeysDir, days: mockDays }
    )

    expect(getCert).toBeCalledWith({
      domains: [mockCommonName, ...mockAltNames],
      meta: mockMeta,
      days: mockDays
    })
  }
)

test(
  'should execute commands in cert definitions onChange prop',
  async () => {
    const mockOnWrite = 'mock command'

    await obtainCert(
      '--internal',
      mockPort,
      mockCommonName,
      mockAltNames,
      mockMeta,
      mockCertDirPath,
      { catKeysDir: mockCatKeysDir, days: mockDays, onChange: mockOnWrite }
    )

    expect(execCommand).toBeCalledWith(mockOnWrite, expect.any(Object))
  }
)
