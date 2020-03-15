const path = require('path')
const getConfig = require('../getConfig')
const httpRedirect = require('../httpRedirect')
const obtainCert = require('./obtainCert')

module.exports = async (opts) => {
  const config = (await getConfig()).client
  const { host, port, httpRedirectUrl } = config
  const domains = opts.domains.split(',')
  const [commonName, ...altNames] = domains
  const certName = opts['cert-name'] || commonName

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  await obtainCert(
    host,
    port,
    commonName,
    altNames,
    opts['test-cert'],
    path.resolve(config.certDir, certName),
    { cahKeysDir: opts.cahkeys }
  )

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }
}
