const getLocalCertificates = require('../getLocalCertificates')
const getConfig = require('../getConfig')
const httpRedirect = require('../httpRedirect')
const getDomainsFromConfig = require('./getDomainsFromConfig')
const obtainCert = require('./obtainCert')
const path = require('path')
const debug = require('debug')('certcache:syncCerts')
const copyCert = require('../helpers/copyCert')
const fileExists = require('../helpers/fileExists')
const getMetaFromCert =
  require('../getMetaFromBackendFunction')('getMetaFromCert')
const getMetaFromSyncItem =
  require('../getMetaFromBackendFunction')('getMetaFromSyncItem')

module.exports = async () => {
  const config = (await getConfig()).client
  const {
    cahkeys,
    certDir,
    domains,
    httpRedirectUrl,
    host,
    port,
    renewalDays
  } = config
  const certcacheCertDir = path.resolve(certDir)
  const localCerts = await getLocalCertificates(certcacheCertDir)
  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + renewalDays)

  const certsForRenewal = localCerts
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))

  const configDomains = getDomainsFromConfig(domains)
  const configDomainsFileExistsSearch = (await Promise.all(configDomains.map(
    ({ certName }) => fileExists(path.resolve(certDir, certName))
  )))
  const configDomainsNotOnFs = configDomains.filter((_, i) => (
    configDomainsFileExistsSearch[i] === false
  ))
  debug('Searching for local certs in', certcacheCertDir)
  const certsToCopyWhenReceived = []

  const configDomainsForRenewal = configDomainsNotOnFs.map((configDomain) => ({
    commonName: configDomain.domains[0],
    altnames: configDomain.domains,
    meta: getMetaFromSyncItem(configDomain),
    certDir: path.resolve(certDir, configDomain.certName)
  }))

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  const certsToRequest = [
    ...configDomainsForRenewal,
    ...certsForRenewal.map((cert) => ({
      ...cert,
      certDir: path.dirname(cert.certPath),
      meta: getMetaFromCert(cert)
    }))
  ]

  const obtainCertErrors = []

  await Promise.all(
    certsToRequest.map(async ({ altNames, certDir, commonName, meta }) => {
      try {
        await obtainCert(
          host,
          port,
          commonName,
          altNames,
          meta,
          certDir,
          { cahKeysDir: cahkeys, days: renewalDays }
        )
      } catch (e) {
        obtainCertErrors.push(e.message)
      }
    })
  )

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }

  await Promise.all(certsToCopyWhenReceived.map(([fromDir, toDir]) => {
    return copyCert(fromDir, toDir)
  }))

  const numRequested = certsForRenewal.length + configDomainsForRenewal.length
  const numTotal = localCerts.length + configDomainsForRenewal.length
  const numFailed = obtainCertErrors.length
  const msg = [
    numRequested,
    'of',
    numTotal,
    'certs requested.',
    numFailed,
    'failed.',
    numRequested - numFailed,
    'completed.'
  ]

  console.log(msg.join(' '))

  if (obtainCertErrors.length !== 0) {
    throw new Error(obtainCertErrors.join('\n'))
  }
}
