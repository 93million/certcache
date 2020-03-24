module.exports = {
  get: {
    'test-cert': {
      alias: 't',
      boolean: true,
      default: false,
      description: 'Generate a test certificate when using Certbot'
    }
  },
  serve: {
    'certbot-email': {
      description: 'Email to use when obtain certificates using Certbot'
    }
  }
}
