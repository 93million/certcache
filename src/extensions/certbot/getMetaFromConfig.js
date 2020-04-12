module.exports = (config) => {
  return { isTest: (config.client.extensions.certbot['test-cert'] === true) }
}
