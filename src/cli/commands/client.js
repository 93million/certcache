const getConfig = require('../../lib/getConfig')
const syncCerts = require('../../lib/client/syncCerts')
const { cahkeys, days, host, httpRedirectUrl, port } = require('./args')

module.exports = {
  cmd: 'client',
  desc: 'Start client that continuously syncs certs Certcache server',
  builder: { cahkeys, days, 'http-redirect-url': httpRedirectUrl, host, port },
  handler: async (argv) => {
    const config = (await getConfig()).client
    const syncPeriodically = () => {
      syncCerts(argv).catch((e) => { console.error(e) })
      setTimeout(syncPeriodically, 1000 * config.syncInterval)
    }
    syncPeriodically()
  }
}
