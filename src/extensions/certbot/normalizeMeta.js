const getConfig = require('../../lib/getConfig')

module.exports = async ({ ellipticCurve, keyType, isTest }) => {
  const config = await getConfig()

  ellipticCurve = ellipticCurve || config.ellipticCurve
  keyType = keyType || config.keyType

  return {
    ellipticCurve: (keyType === 'ecdsa') ? ellipticCurve : undefined,
    keyType,
    isTest
  }
}
