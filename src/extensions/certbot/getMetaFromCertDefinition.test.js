/* global test expect */

const getMetaFromCertDefinition = require('./getMetaFromCertDefinition')

const ellipticCurve = 'testcurve'
const keyType = 'ecdsa'
const testCert = true

test(
  'should return object when supplied with certDefinition',
  async () => {
    await expect(getMetaFromCertDefinition({
      ellipticCurve,
      keyType,
      testCert
    }))
      .resolves
      .toEqual({ ellipticCurve, keyType, isTest: testCert })
  }
)

test(
  // eslint-disable-next-line max-len
  'should return property ellipticCurve of undefined unless keyType = \'ecdsa\'',
  () => {
    expect(getMetaFromCertDefinition({
      ellipticCurve,
      keyType: 'rsa',
      testCert
    }))
      .toHaveProperty('ellipticCurve', undefined)
  }
)

test(
  'should return default prop isTest of false',
  async () => {
    await expect(getMetaFromCertDefinition({}))
      .resolves
      .toHaveProperty('isTest', false)
  }
)
