const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')('certcache:server/actions/getCert')
const yaml = require('yaml')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const arrayItemsMatch = require('../../helpers/arrayItemsMatch')
const getCertLocators = require('../../getCertLocators')
const getCertGeneratorsForDomains = require('../../getCertGeneratorsForDomains')

module.exports = async (payload, { req }) => {
  const { isTest, domains, notAfter: notAfterTs } = payload
  const clientCertCommonName = req.connection.getPeerCertificate().subject.CN
  const days = payload.days || 30
  const notAfter = (notAfterTs === undefined)
    ? new Date()
    : new Date(notAfterTs)
  const certRenewDate = new Date()
  certRenewDate.setDate(certRenewDate.getDate() + days)

  if (process.env.CERTCACHE_CLIENT_CERT_RESTRICTIONS !== undefined) {
    const clientCertRestrictions =
      yaml.parse(process.env.CERTCACHE_CLIENT_CERT_RESTRICTIONS)

    if (!clientPermittedAccessToCerts(
      clientCertRestrictions,
      clientCertCommonName,
      domains
    )) {
      throw new FeedbackError([
        'Client',
        clientCertCommonName,
        'does not have permission to generate the requested certs'
      ].join(' '))
    }
  }

  const commonName = domains[0]
  const altNames = domains

  debug('Request for certificate', domains, 'is test', isTest)

  const certLocators = await getCertLocators()
  const certGenerators = await getCertGeneratorsForDomains(domains)

  const localCertSearch = await Promise
    .all(certLocators.map(
      async (certLocator) => {
        const localCerts = await certLocator.getLocalCerts()

        localCerts.sort((a, b) => {
          return (a.notAfter.getTime() > b.notAfter.getTime()) ? -1 : 1
        })

        const matchingCerts = localCerts.find(({
          altNames: certAltNames,
          commonName: certCommonName,
          issuerCommonName,
          notAfter: certNotAfter
        }) => {
          const certIsTest = issuerCommonName.startsWith('Fake')

          return (
            certIsTest === (isTest === true) &&
            certCommonName === commonName &&
            (
              arrayItemsMatch(certAltNames, altNames) ||
              (certAltNames.length === 0 && altNames.length === 1)
            ) &&
            certNotAfter.getTime() > notAfter.getTime()
          )
        })

        return matchingCerts
      }
    ))

  const localCert = localCertSearch
    .find((localCert) => (localCert !== undefined))

  let cert

  if (
    localCert !== undefined &&
    localCert.notAfter.getTime() >= certRenewDate.getTime()
  ) {
    debug('Found matching cert locally', domains)
    cert = localCert
  } else {
    debug('No local certificate found - executing cert generators', domains)
    try {
      cert = await generateFirstCertInSequence(
        certGenerators,
        commonName,
        altNames,
        { isTest }
      )
    } catch (e) {
      if (localCert !== undefined) {
        cert = localCert
      } else {
        throw e
      }
    }
  }

  if (cert === undefined) {
    throw new FeedbackError('Unable to find or generate requested certificate')
  }

  return { bundle: Buffer.from(await cert.getArchive()).toString('base64') }
}
