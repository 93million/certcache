module.exports = {
  cahkeys: {
    alias: 'k',
    description: 'Path to cahkeys directory. Alternativly use env CERTCACHE_CAH_KEYS_DIR'
  },
  days: {
    description: 'Number of days to renew certificate before expiry'
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
    description: 'Port to connect to Certcache server'
  }
}
