/* global jest test expect beforeEach */

const generateFirstCertInSequence = require('./generateFirstCertInSequence')
const Certificate = require('./classes/Certificate')

let parallelCalls
const numParallelCalls = []
let mockCert
const errorMessage = 'barf!'

jest.mock('./classes/Certificate')

Certificate.fromPath.mockImplementation((handlers, certPath) => {
  return Promise.resolve(mockCert)
})

const createGeneratedCertMock = ({ shouldThrowError = false } = {}) => {
  const generateCert = jest.fn()

  generateCert.mockImplementation(() => {
    parallelCalls++
    numParallelCalls.push(parallelCalls)
    parallelCalls--

    if (shouldThrowError) {
      throw new Error(errorMessage)
    }

    return Promise.resolve('/path/to/mock/cert')
  })

  return generateCert
}

const certGenerators = [
  { generateCert: createGeneratedCertMock() },
  { generateCert: createGeneratedCertMock() }
]
const commonName = 'example.com'
const altNames = ['www.example.com', 'test.example.com', 'test2.example.com']
const isTest = false
const config = {}

beforeEach(() => {
  parallelCalls = 0
  mockCert = { _test_: 58008 }
})

test(
  'should iterate sequentially over generators',
  async () => {
    await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      { isTest },
      config
    )

    expect(Math.max(...numParallelCalls)).toBe(1)
  }
)

test(
  'should return a Certificate object if cert is generated',
  async () => {
    const cert = await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      { isTest },
      config
    )

    expect(cert).toBe(mockCert)
  }
)

test(
  'should return undefined if cert cannot be generated',
  async () => {
    mockCert = undefined

    const cert = await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      { isTest },
      config
    )

    expect(cert).toBeUndefined()
  }
)
