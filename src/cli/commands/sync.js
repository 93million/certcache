const syncCerts = require('../../lib/client/syncCerts')
const { cahkeys, host, httpRedirectUrl, port } = require('./args')

module.exports = {
  cmd: 'sync',
  desc: 'Sync certs once and exit',
  builder: { cahkeys, 'http-redirect-url': httpRedirectUrl, host, port },
  handler: (argv) => {
    syncCerts(argv).catch((e) => {
      console.error(e)
      process.exit(1)
    })
  }
}
