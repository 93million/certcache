const fileExists = require('../lib/helpers/fileExists')

module.exports = async () => ({
  binDir: 'bin',
  catKeysDir: await fileExists('cahkeys') ? 'cahkeys' : 'catkeys',
  certDir: 'certs',
  certs: [],
  ellipticCurve: 'secp256r1',
  httpRequestInterval: 1,
  keyType: 'rsa',
  maxRequestTime: 90,
  renewalDays: 30,
  server: { port: 4433 },
  syncInterval: 60 * 6,
  upstream: '--internal'
})
