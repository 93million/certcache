const getCert = require('../../lib/client/getCert')
const {
  catkeys,
  days,
  ellipticCurve,
  keyType,
  upstream,
  httpRedirectUrl,
  maxRequestTime,
  skipFilePerms
} = require('./args')

module.exports = {
  cmd: 'get',
  desc: 'Get a single cert from Certcache server',
  builder: {
    catkeys,
    'cert-name': {
      description: 'Certificate name (used for certificate directory name)'
    },
    days,
    domains: {
      alias: 'd',
      description: 'List of comma-separated domain domains',
      required: true
    },
    'elliptic-curve': ellipticCurve,
    'http-redirect-url': httpRedirectUrl,
    'key-type': keyType,
    'max-request-time': maxRequestTime,
    'skip-file-perms': skipFilePerms,
    upstream
  },
  handler: async (argv) => {
    getCert(await argv).catch((e) => {
      console.error(e.message)
      process.exit(1)
    })
  }
}
