/* global jest test expect beforeEach */

const generateFirstCertInSequence = require('./generateFirstCertInSequence')

const generateCert = jest.fn()
let parallelCalls = 0
const numParallelCalls = []
const mockCert = { _test_: 58008 }
const errorMessage = 'barf!'

generateCert.mockImplementation((shouldThrow = false) => {
  parallelCalls++
  numParallelCalls.push(parallelCalls)
  parallelCalls--

  return (shouldThrow)
    ? Promise.reject(new Error(errorMessage))
    : Promise.resolve(mockCert)
})

const certGenerators = [...Array(5).keys()].map((i) => ({
  generateCert: () => generateCert(i !== 3)
}))
const commonName = 'example.com'
const altNames = ['www.example.com', 'test.example.com', 'test2.example.com']
const isTest = false
const extras = { isTest }
const config = {}

console.error = jest.fn()

beforeEach(() => {
  console.error.mockClear()
})

test(
  'should iterate sequentially over generators',
  async () => {
    await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      extras,
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
      extras,
      config
    )

    expect(cert).toBe(mockCert)
  }
)

test(
  'should return undefined if cert cannot be generated',
  async () => {
    const certGenerators = [...Array(5).keys()].map((i) => ({
      generateCert: () => generateCert(true)
    }))
    const cert = await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      extras,
      config
    )

    expect(cert).toBeUndefined()
  }
)

test(
  'should log errors to console.error',
  async () => {
    await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      extras,
      config
    )

    expect(console.error.mock.calls[0][0].message).toBe(errorMessage)
  }
)
