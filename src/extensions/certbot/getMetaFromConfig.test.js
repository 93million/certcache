/* global jest test expect */

const getMetaFromConfig = require('./getMetaFromConfig')

jest.mock('../../lib/getArgv')

const ellipticCurve = 'testcurve'
const keyType = 'ecdsa'
const testCert = true
const extensions = { certbot: { 'test-cert': testCert } }

test(
  'should return object when supplied with certDefinition',
  async () => {
    await expect(getMetaFromConfig({
      ellipticCurve,
      keyType,
      extensions
    }))
      .resolves
      .toEqual({ ellipticCurve, keyType, isTest: testCert })
  }
)

test(
  // eslint-disable-next-line max-len
  'should return property ellipticCurve of undefined unless keyType = \'ecdsa\'',
  async () => {
    await expect(getMetaFromConfig({
      ellipticCurve,
      keyType: 'rsa',
      extensions
    }))
      .resolves
      .toHaveProperty('ellipticCurve', undefined)
  }
)

test(
  'should return default prop isTest of false',
  async () => {
    await expect(getMetaFromConfig({})).resolves.toHaveProperty('isTest', false)
  }
)
