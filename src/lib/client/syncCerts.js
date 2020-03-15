const getLocalCertificates = require('../getLocalCertificates')
const getConfig = require('../getConfig')
const httpRedirect = require('../httpRedirect')
const yaml = require('yaml')
const getDomainsFromConfig = require('./getDomainsFromConfig')
const obtainCert = require('./obtainCert')
const path = require('path')
const debug = require('debug')('certcache:syncCerts')

module.exports = async (opts) => {
  const config = (await getConfig()).client
  const configDomains = (process.env.CERTCACHE_DOMAINS !== undefined)
    ? getDomainsFromConfig(yaml.parse(process.env.CERTCACHE_DOMAINS))
    : []
  const certcacheCertDir = path.resolve(config.certDir)
  debug('Searching for local certs in', certcacheCertDir)
  const certs = await getLocalCertificates(certcacheCertDir)
  debug('Local certs:', certs)
  const configDomainsWithoutCert = configDomains
    .filter(({ domains, isTest }) => {
      return certs.findCert(
        {
          commonName: domains[0],
          altNames: domains
        },
        { isTest: (isTest === true) }
      ) === undefined
    })
  debug(
    'Certs in CERTCACHE_DOMAINS not in local cert dir:',
    configDomainsWithoutCert
  )
  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + config.renewalDays)

  const certsForRenewal = certs
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))

  debug(
    `Local certs that expiring in next ${config.renewalDays} days:`,
    certsForRenewal
  )

  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl
  const host = opts.host || config.host
  const port = opts.port || config.port

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  const certRenewalPromise = Promise.all(certsForRenewal.map(async ({
    commonName,
    altNames,
    issuerCommonName,
    certPath
  }) => {
    const isTest = issuerCommonName.startsWith('Fake')

    return obtainCert(
      host,
      port,
      commonName,
      altNames,
      isTest,
      path.dirname(certPath),
      { cahKeysDir: opts.cahkeys, days: config.renewalDays }
    )
  }))

  const configDomainPromise = Promise.all(configDomainsWithoutCert.map(
    async ({ domains, isTest, certName }) => obtainCert(
      host,
      port,
      domains[0],
      domains,
      isTest,
      path.resolve(config.certDir, certName)
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
