const serve = require('../../lib/server/serve')
const { catkeys } = require('./args')

module.exports = {
  cmd: 'serve',
  desc: 'Start certcache server',
  builder: {
    catkeys,
    port: {
      alias: 'p',
      description: 'Port to run Certcache server'
    }
  },
  handler: (argv) => {
    serve(argv)
  }
}
