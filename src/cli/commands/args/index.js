module.exports = {
  cahkeys: {
    alias: 'k',
    description: 'Path to cahkeys directory. Alternativly use env CERTCACHE_CAH_KEYS_DIR'
  },
  days: {
    description: 'Number of days to renew certificate before expiry'
  },
  httpRedirectUrl: {
    description: 'Address of a Certcache server to redirect challenges to when Certcache client server is recipient of HTTP-01 ACME challenges'
  },
  host: {
    alias: 'h',
    description: 'Hostname of upstream Certcache Server. Include portname in format <hostname>:<port>'
  }
}
