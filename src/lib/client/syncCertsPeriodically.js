const config = require('../../config')
const syncCerts = require('./syncCerts')

const syncPeriodically = () => {
  syncCerts().catch((e) => { console.error(`ERROR! ${e}`) })
  setTimeout(syncPeriodically, 1000 * config.clientSyncInterval)
}

module.exports = syncPeriodically
