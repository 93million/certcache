/* global test expect */

const getMetaFromConfig = require('./getMetaFromConfig')

const ellipticCurve = 'testcurve'
const keyType = 'ecdsa'
const testCert = true

test(
  'should return object when supplied with certDefinition',
  async () => {
    await expect(getMetaFromConfig({
      ellipticCurve,
      keyType,
      'test-cert': testCert
    }))
      .resolves
      .toEqual({ ellipticCurve, keyType, isTest: testCert })
  }
)

test(
  // eslint-disable-next-line max-len
  'should return property ellipticCurve of undefined unless keyType = \'ecdsa\'',
  () => {
    expect(getMetaFromConfig({
      ellipticCurve,
      keyType: 'rsa',
      'test-cert': testCert
    }))
      .toHaveProperty('ellipticCurve', undefined)
  }
)

test(
  'should return default prop isTest of false',
  async () => {
    await expect(getMetaFromConfig({})).resolves.toHaveProperty('isTest', false)
  }
)
