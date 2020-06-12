const getCert = require('../../lib/client/getCert')
const {
  cahkeys,
  days,
  upstream,
  httpRedirectUrl,
  maxRequestTime,
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
    'http-redirect-url': httpRedirectUrl,
    'max-request-time': maxRequestTime,
    'skip-file-perms': skipFilePerms,
    upstream
  },
  handler: (argv) => {
    getCert(argv).catch((e) => {
      console.error(e.message)
      process.exit(1)
    })
  }
}
