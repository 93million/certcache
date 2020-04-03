module.exports = (config) => {
  return { isTest: (config.client.backends.certbot['test-cert'] === true) }
}
