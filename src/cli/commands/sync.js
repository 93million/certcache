const getConfig = require('../../lib/getConfig')
const defaultConfig = require('../../config/defaults')
const syncCerts = require('../../lib/client/syncCerts')
const { cahkeys, days, host, httpRedirectUrl, port } = require('./args')

module.exports = {
  cmd: 'sync',
  desc: 'Sync certificates with Certcache server',
  builder: {
    cahkeys,
    days,
    forever: {
      description: 'Continue to poll for new certificates from the Certcache server'
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
    const config = (await getConfig()).client
    const syncPeriodically = () => {
      syncCerts(argv).catch((e) => {
        console.error(e)

        if (argv.forever !== true) {
          process.exit(1)
        }
      })
      if (argv.forever === true) {
        setTimeout(syncPeriodically, 1000 * config.syncInterval)
      }
    }

    syncPeriodically()
  }
}
