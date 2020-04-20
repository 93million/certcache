module.exports = (config) => {
  return { isTest: (config.extensions.certbot['test-cert'] === true) }
}
