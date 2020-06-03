const getCert = require('../../lib/client/getCert')
const {
  cahkeys,
  days,
  host,
  httpRedirectUrl,
  skipFilePerms
} = require('./args')

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
    'skip-file-perms': skipFilePerms
  },
  handler: (argv) => {
    getCert(argv).catch((e) => {
      console.error(e.message)
      process.exit(1)
    })
  }
}
