const getLocalCertificates = require('../getLocalCertificates')
const config = require('../../config')
const httpRedirect = require('../httpRedirect')
const yaml = require('yaml')
const getDomainsFromConfig = require('./getDomainsFromConfig')
const obtainCert = require('./obtainCert')
const path = require('path')
const debug = require('debug')('certcache:syncCerts')

module.exports = async (opts) => {
  const configDomains = (process.env.CERTCACHE_DOMAINS !== undefined)
    ? getDomainsFromConfig(yaml.parse(process.env.CERTCACHE_DOMAINS))
    : []
  const certcacheCertDir = config.certcacheCertDir
  debug('Searching for local certs in', certcacheCertDir)
  const certs = await getLocalCertificates(certcacheCertDir)
  debug('Local certs:', certs)
  const configDomainsWithoutCert = configDomains
    .filter(({ domains, isTest }) => {
      return certs.findCert(
        domains[0],
        domains,
        { isTest: (isTest === true) }
      ) === undefined
    })
  debug(
    'Certs in CERTCACHE_DOMAINS not in local cert dir:',
    configDomainsWithoutCert
  )
  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + config.renewDaysBefore)

  const certsForRenewal = certs
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))

  debug(`Local certs that expiring in next ${config.renewDaysBefore} days:`, certsForRenewal)

  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl
  const host = opts.host || config.certcacheHost
  const port = opts.port || config.certcachePort

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  const certRenewalPromise = Promise.all(certsForRenewal.map(async ({
    commonName,
    altNames,
    issuerCommonName,
    certPath
  }) => {
    const isTest = (issuerCommonName.indexOf('Fake') !== -1)

    return obtainCert(
      host,
      port,
      commonName,
      altNames,
      isTest,
      path.dirname(certPath)
    )
  }))

  const configDomainPromise = Promise.all(configDomainsWithoutCert.map(
    async ({ domains, isTest, certName }) => obtainCert(
      host,
      port,
      domains[0],
      domains,
      isTest,
      `${config.certcacheCertDir}/${certName}`
    )
  ))

  await certRenewalPromise
  await configDomainPromise

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }

  console.log([
    certsForRenewal.length + configDomainsWithoutCert.length,
    'of',
    certs.length + configDomainsWithoutCert.length,
    'certs synced'
  ].join(' '))
}
