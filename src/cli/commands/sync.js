const syncPeriodically = require('../../lib/client/syncPeriodically')
const {
  catkeys,
  days,
  ellipticCurve,
  httpRedirectUrl,
  keyType,
  maxRequestTime,
  skipFilePerms,
  upstream
} = require('./args')

module.exports = {
  cmd: 'sync',
  desc: 'Sync certificates with Certcache server',
  builder: {
    catkeys,
    days,
    'elliptic-curve': ellipticCurve,
    forever: {
      description: 'Sync certificates continuously with Certcache server'
    },
    'http-redirect-url': httpRedirectUrl,
    interval: {
      description: 'Num minutes between polling for certificates'
    },
    'key-type': keyType,
    'max-request-time': maxRequestTime,
    'skip-file-perms': skipFilePerms,
    upstream
  },
  handler: async (argv) => {
    await syncPeriodically(argv.forever)
  }
}
