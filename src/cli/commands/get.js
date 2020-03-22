const getCert = require('../../lib/client/getCert')
const { cahkeys, days, host, httpRedirectUrl, port } = require('./args')

module.exports = {
  cmd: 'get',
  desc: 'Get a single cert from Certcache server',
  builder: {
    cahkeys,
    'cert-name': {
      description: 'Certificate name (used for certificate directory name)'
    },
    days,
    domains: {
      alias: 'd',
      description: 'List of comma-separated domain domains',
      required: true
    },
    host,
    'http-redirect-url': httpRedirectUrl,
    port,
    'test-cert': {
      alias: 't',
      boolean: true,
      default: false,
      description: 'Generate a test certificate'
    }
  },
  handler: (argv) => {
    getCert(argv).catch((e) => {
      console.error(e)
      process.exit(1)
    })
  }
}
