const md5 = require('md5')

module.exports = (
  commonName,
  altNames,
  { isTest = false, keyType, ellipticCurve } = {}
) => md5(JSON.stringify({
  commonName,
  altNames: altNames.map((name) => name.toLowerCase()).sort(),
  isTest,
  keyType,
  ellipticCurve
}))
