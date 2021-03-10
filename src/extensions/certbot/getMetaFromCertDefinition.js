const getConfig = require('../../lib/getConfig')

module.exports = async ({ ellipticCurve, keyType, testCert }) => {
  const config = await getConfig()

  ellipticCurve = ellipticCurve || config.ellipticCurve
  keyType = keyType || config.keyType

  keyType = keyType.toLocaleLowerCase()
  ellipticCurve = ellipticCurve.toLocaleLowerCase()

  return {
    ellipticCurve: (keyType === 'ecdsa') ? ellipticCurve : undefined,
    isTest: (testCert === true),
    keyType
  }
}
