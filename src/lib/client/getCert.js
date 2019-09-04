const config = require('../../config')
const httpRedirect = require('../httpRedirect')
const obtainCert = require('./obtainCert')

module.exports = async (opts) => {
  const host = opts.host || config.certcacheHost
  const port = opts.port || config.certcachePort
  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl
  const domains = opts.domains.split(',')
  const [commonName, ...altNames] = domains
  const certName = opts['cert-name'] || commonName

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  await obtainCert(
    host,
    port,
    domains[0],
    altNames,
    opts['test-cert'],
    `${config.certcacheCertDir}/${certName}`
  )

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }
}
