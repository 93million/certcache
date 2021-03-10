module.exports = {
  catkeys: {
    alias: 'k',
    description:
      'Path to catkeys directory. Alternativly use env CERTCACHE_CAH_KEYS_DIR'
  },
  days: {
    description: 'Number of days to renew certificate before expiry'
  },
  ellipticCurve: {
    description:
      'Curve to use when key type is ecdsa. See RFC 8446 for supported values.'
  },
  httpRedirectUrl: {
    description: [
      'Address of a Certcache server to redirect challenges to when Certcache',
      'client server is recipient of HTTP-01 ACME challenges'
    ].join(' ')
  },
  keyType: {
    description: 'Type of key to search for (either ecdsa or rsa)'
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
