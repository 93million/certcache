/* global jest test expect */

const normalizeMeta = require('./normalizeMeta')
const getConfig = require('../../lib/getConfig')

jest.mock('../../lib/getConfig')

const mockConfig = {
  ellipticCurve: 'mockConfigCurve',
  keyType: 'ecdsa'
}

getConfig.mockReturnValue(mockConfig)

const ellipticCurve = 'testCurve'
const isTest = true
const keyType = 'ecdsa'
const mockMeta = {
  shouldNotPersist: 'should be removed',
  ellipticCurve,
  keyType,
  isTest
}
const expected = {
  ellipticCurve,
  keyType,
  isTest
}

test(
  'should return object containing only relevant properties',
  async () => {
    await expect(normalizeMeta(mockMeta)).resolves.toEqual(expected)
  }
)

test(
  'should populate missing values with default config values',
  async () => {
    await expect(normalizeMeta({ isTest: false }))
      .resolves
      .toEqual({
        ellipticCurve: mockConfig.ellipticCurve,
        isTest: false,
        keyType: mockConfig.keyType
      })
  }
)

test(
  'should return ellipticCurve if keyType is ecdsa',
  async () => {
    await expect(normalizeMeta({
      ellipticCurve,
      keyType: 'ecdsa'
    }))
      .resolves
      .toHaveProperty('ellipticCurve', ellipticCurve)
  }
)

test(
  'should return undefined ellipticCurve if keyType is not ecdsa',
  async () => {
    await expect(normalizeMeta({
      ellipticCurve,
      keyType: 'rsa'
    }))
      .resolves
      .toHaveProperty('ellipticCurve', undefined)
  }
)
