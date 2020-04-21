module.exports = {
  get: {
    'test-cert': {
      alias: 't',
      boolean: true,
      description: 'Generate a test certificate when using Certbot'
    }
  },
  serve: {
    'certbot-default-challenge': {
      description:
        'Default challenge to use when obtaining certificates using Certbot'
    },
    'certbot-email': {
      description: 'Email to use when obtaining certificates using Certbot'
    }
  }
}
