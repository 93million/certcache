const path = require('path')
const config = require('../../../config')

module.exports = {
  cahkeys: {
    alias: 'k',
    default: process.env.CERTCACHE_CAH_KEYS_DIR ||
      path.resolve(process.cwd(), 'cahkeys'),
    description: 'Path to cahkeys directory. Alternativly use env CERTCACHE_CAH_KEYS_DIR'
  },
  httpRedirectUrl: {
    description: 'Address of a Certcache server to redirect HTTP-01 ACME challenges to'
  },
  host: {
    alias: 'h',
    description: 'Hostname of Certcache Server'
  },
  port: {
    alias: 'p',
    default: config.certcachePort,
    description: 'Port to connect to Certcache server'
  }
}
