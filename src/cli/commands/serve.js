const serve = require('../../lib/server/serve')
const { cahkeys } = require('./args')

module.exports = {
  cmd: 'serve',
  desc: 'Start certcache server',
  builder: {
    cahkeys,
    port: {
      alias: 'p',
      description: 'Port to run Certcache server'
    }
  },
  handler: (argv) => {
    serve(argv)
  }
}
