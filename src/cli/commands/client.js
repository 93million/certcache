const sync = require('./sync')
const syncPeriodically = require('../../lib/client/syncPeriodically')

const { forever, ...builder } = sync.builder

module.exports = {
  cmd: 'client',
  desc: `${forever.description} (aliases 'sync --forever')`,
  builder,
  handler: async () => {
    await syncPeriodically(true)
  }
}
