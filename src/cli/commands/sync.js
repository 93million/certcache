const defaultConfig = require('../../config/defaults')
const syncPeriodically = require('../../lib/client/syncPeriodically')
const { cahkeys, days, host, httpRedirectUrl, port } = require('./args')

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
    port,
    interval: {
      default: defaultConfig.client.syncInterval / 60,
      description: 'Num minutes between polling for certificates'
    }
  },
  handler: async (argv) => {
    await syncPeriodically(argv, argv.forever)
  }
}
