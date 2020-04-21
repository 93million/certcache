const path = require('path')
const getConfig = require('../getConfig')
const httpRedirect = require('../httpRedirect')
const obtainCert = require('./obtainCert')
const getMetaFromConfig =
  require('../getMetaFromExtensionFunction')('getMetaFromConfig')
const normaliseUpstreamConfig = require('../normaliseUpstreamConfig')

module.exports = async (opts) => {
  const config = (await getConfig())
  const {
    certDir,
    httpRedirectUrl,
    renewalDays,
    upstream
  } = config
  const domains = opts.domains.split(',')
  const commonName = domains[0]
  const altNames = domains
  const certName = opts['cert-name'] || commonName
  const meta = await getMetaFromConfig(config)
  const { host, port } = normaliseUpstreamConfig(upstream)

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  await obtainCert(
    host,
    port,
    commonName,
    altNames,
    meta,
    path.resolve(certDir, certName),
    { cahKeysDir: config.cahKeysDir, days: renewalDays }
  )

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }
}
