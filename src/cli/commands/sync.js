const syncPeriodically = require('../../lib/client/syncPeriodically')
const {
  cahkeys,
  days,
  upstream,
  httpRedirectUrl,
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
    'skip-file-perms': skipFilePerms,
    upstream
  },
  handler: async (argv) => {
    await syncPeriodically(argv.forever)
  }
}
