const config = require('../../config')
const syncCerts = require('../../lib/client/syncCerts')

module.exports = {
  cmd: 'client',
  desc: 'Start client that continuously syncs certs Certcache server',
  builder: {
    host: { alias: 'h' },
    port: {
      alias: 'p',
      default: config.certcachePort,
      description: 'Port to connect to Certcache server'
    }
  },
  handler: (argv) => {
    const syncPeriodically = () => {
      syncCerts().catch((e) => { console.error(`ERROR! ${e}`) })
      setTimeout(syncPeriodically, 1000 * config.clientSyncInterval)
    }
    syncPeriodically()
  }
}
