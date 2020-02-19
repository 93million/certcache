const config = require('../../config')
const syncCerts = require('../../lib/client/syncCerts')

module.exports = {
  cmd: 'sync',
  desc: 'Sync certs once and exit',
  builder: {
    host: { alias: 'h' },
    port: {
      alias: 'p',
      default: config.certcachePort,
      description: 'Port to connect to Certcache server'
    }
  },
  handler: (argv) => {
    syncCerts(argv).catch((e) => {
      console.error(e)
      process.exit(1)
    })
  }
}
