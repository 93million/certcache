const config = require('../../config')
const serve = require('../../lib/server/serve')

module.exports = {
  cmd: 'serve',
  desc: 'Start certcache server',
  builder: {
    port: {
      alias: 'p',
      default: config.certcachePort,
      description: 'Port to run Certcache server'
    }
  },
  handler: (argv) => {
    serve(argv)
  }
}
