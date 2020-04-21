const syncPeriodically = require('../../lib/client/syncPeriodically')
const { cahkeys, days, host, httpRedirectUrl } = require('./args')

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
    }
  },
  handler: async (argv) => {
    await syncPeriodically(argv.forever)
  }
}
