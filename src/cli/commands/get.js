const config = require('../../config')
const getCert = require('../../lib/client/getCert')

module.exports = {
  cmd: 'get',
  desc: 'Get a single cert from Certcache server',
  builder: {
    'cert-name': {
      description: 'Certificate name (used for certificate directory name)'
    },
    domains: {
      alias: 'd',
      description: 'List of comma-separated domain domains',
      required: true
    },
    host: {
      alias: 'h',
      description: 'Hostname of Certcache Server'
    },
    'http-redirect-url': {
      description: 'Address of a Certcache server to redirect HTTP-01 ACME challenges to'
    },
    port: {
      alias: 'p',
      default: config.certcachePort,
      description: 'Port to connect to Certcache server'
    },
    'test-cert': {
      alias: 't',
      boolean: true,
      default: false,
      description: 'Generate a test certificate'
    }
  },
  handler: (argv) => {
    getCert(argv).catch((e) => {
      console.error(`ERROR! ${e}`)
      process.exit(1)
    })
  }
}
