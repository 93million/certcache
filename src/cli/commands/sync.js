const syncPeriodically = require('../../lib/client/syncPeriodically')
const {
  cahkeys,
  days,
  host,
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
    host,
    'http-redirect-url': httpRedirectUrl,
    interval: {
      description: 'Num minutes between polling for certificates'
    },
    'skip-file-perms': skipFilePerms
  },
  handler: async (argv) => {
    await syncPeriodically(argv.forever)
  }
}
