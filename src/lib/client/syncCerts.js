const getLocalCertificates = require('../getLocalCertificates')
const getConfig = require('../getConfig')
const httpRedirect = require('../httpRedirect')
const getDomainsFromConfig = require('./getDomainsFromConfig')
const obtainCert = require('./obtainCert')
const path = require('path')
const debug = require('debug')('certcache:syncCerts')
const arrayItemsMatch = require('../helpers/arrayItemsMatch')
const copyCert = require('../helpers/copyCert')
const fileExists = require('../helpers/fileExists')

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
  const configDomainsForRenewal = []
  const certsToCopyWhenReceived = []

  await Promise.all(configDomainsNotOnFs.map(
    async ({ domains, isTest, certName }) => {
      const findCert = ({
        commonName, altNames, issuerCommonName
      }) => {
        return (
          commonName === domains[0] &&
          (
            arrayItemsMatch(altNames, domains) ||
            (altNames.length === 0 && domains.length === 1)
          ) &&
          issuerCommonName.startsWith('Fake') === (isTest === true)
        )
      }
      const certsForRenewalSearch = certsForRenewal.find(findCert)
      const localCertsSearch = localCerts.find(findCert)

      if (localCertsSearch !== undefined) {
        if (certsForRenewalSearch === undefined) {
          await copyCert(
            path.dirname(localCertsSearch.certPath),
            path.resolve(certDir, certName)
          )
        } else {
          certsToCopyWhenReceived.push([
            certsForRenewalSearch.certPath,
            path.resolve(certDir, certName)
          ])
        }
      } else {
        configDomainsForRenewal.push({
          commonName: domains[0],
          altnames: domains,
          isTest,
          certDir: path.resolve(certDir, certName)
        })
      }
    }
  ))

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  const certsToRequest = [
    ...configDomainsForRenewal,
    ...certsForRenewal.map(({ certPath, issuerCommonName, ...cert }) => ({
      ...cert,
      certDir: path.dirname(certPath),
      isTest: issuerCommonName.startsWith('Fake')
    }))
  ]

  const obtainCertErrors = []

  await Promise.all(
    certsToRequest.map(async ({ altNames, certDir, commonName, isTest }) => {
      try {
        await obtainCert(
          host,
          port,
          commonName,
          altNames,
          isTest,
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
