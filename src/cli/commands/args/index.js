module.exports = {
  cahkeys: {
    alias: 'k',
    description:
      'Path to cahkeys directory. Alternativly use env CERTCACHE_CAH_KEYS_DIR'
  },
  days: {
    description: 'Number of days to renew certificate before expiry'
  },
  httpRedirectUrl: {
    description: [
      'Address of a Certcache server to redirect challenges to when Certcache',
      'client server is recipient of HTTP-01 ACME challenges'
    ].join(' ')
  },
  maxRequestTime: {
    description:
      'Maximum time (in minutes) requests to CertCache server should take'
  },
  skipFilePerms: {
    boolean: true,
    description:
      'Don\'t test or set directory file permissions when writing certificates'
  },
  upstream: {
    alias: 'u',
    description: [
      'Upstream hostname of upstream Certcache Server.',
      'Include port in format <hostname>:<port>'
    ].join(' ')
  }
}
