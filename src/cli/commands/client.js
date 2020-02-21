const config = require('../../config')
const syncCerts = require('../../lib/client/syncCerts')
const { cahkeys, host, httpRedirectUrl, port } = require('./args')

module.exports = {
  cmd: 'client',
  desc: 'Start client that continuously syncs certs Certcache server',
  builder: { cahkeys, 'http-redirect-url': httpRedirectUrl, host, port },
  handler: (argv) => {
    const syncPeriodically = () => {
      syncCerts(argv).catch((e) => { console.error(e) })
      setTimeout(syncPeriodically, 1000 * config.clientSyncInterval)
    }
    syncPeriodically()
  }
}
