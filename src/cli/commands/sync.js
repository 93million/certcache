const syncPeriodically = require('../../lib/client/syncPeriodically')
const {
  cahkeys,
  days,
  upstream,
  httpRedirectUrl,
  maxRequestTime,
  skipFilePerms
} = require('./args')

module.exports = {
  cmd: 'sync',
  desc: 'Sync certificates with Certcache server',
  builder: {
    cahkeys,
    days,
    forever: {
      description: 'Sync certificates continuously with Certcache server'
    },
    'http-redirect-url': httpRedirectUrl,
    interval: {
      description: 'Num minutes between polling for certificates'
    },
    'max-request-time': maxRequestTime,
    'skip-file-perms': skipFilePerms,
    upstream
  },
  handler: async (argv) => {
    await syncPeriodically(argv.forever)
  }
}
