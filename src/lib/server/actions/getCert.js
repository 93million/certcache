const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')('certcache:server/actions/getCert')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const arrayItemsMatch = require('../../helpers/arrayItemsMatch')
const getCertLocators = require('../../getCertLocators')
const getCertGeneratorsForDomains = require('../../getCertGeneratorsForDomains')
const getConfig = require('../../getConfig')

const checkRestrictions = async (clientName, domains) => {
  const config = await getConfig()

  if (config.server.clientRestrictions !== undefined) {
    if (!clientPermittedAccessToCerts(
      config.server.clientRestrictions,
      clientName,
      domains
    )) {
      throw new FeedbackError([
        'Client',
        clientName,
        'does not have permission to generate the requested certs'
      ].join(' '))
    }
  }
}

const findLocalCert = async (commonName, altNames, meta, days) => {
  const certLocators = await getCertLocators()
  const certRenewDate = new Date()

  certRenewDate.setDate(certRenewDate.getDate() + days)

  const localCertSearch = await Promise
    .all(certLocators.map(
      async (certLocator) => {
        const localCerts = await certLocator.getLocalCerts()
        const filterCert = (
          certLocator.filterCert !== undefined &&
          meta[certLocator.id] !== undefined
        )
          ? certLocator.filterCert(meta[certLocator.id])
          : () => true

        localCerts.sort((a, b) => {
          return (a.notAfter.getTime() > b.notAfter.getTime()) ? -1 : 1
        })

        const matchingCerts = localCerts.find((cert) => {
          const {
            altNames: certAltNames,
            commonName: certCommonName,
            notAfter: certNotAfter
          } = cert

          return (
            certCommonName === commonName &&
            (
              arrayItemsMatch(certAltNames, altNames) ||
              (certAltNames.length === 0 && altNames.length === 1)
            ) &&
            certNotAfter.getTime() > certRenewDate.getTime() &&
            filterCert(cert)
          )
        })

        return matchingCerts
      }
    ))

  return localCertSearch.find((localCert) => (localCert !== undefined))
}

module.exports = async (payload, { req }) => {
  const { meta, domains, days = 30 } = payload
  const clientName = req.connection.getPeerCertificate().subject.CN
  const commonName = domains[0]
  const altNames = domains

  await checkRestrictions(clientName, domains)
  debug('Request for certificate', domains, 'meta', meta)

  const certGenerators = await getCertGeneratorsForDomains(domains)

  let cert = await findLocalCert(commonName, altNames, meta, days)

  if (cert === undefined) {
    debug('No local certificate found - executing cert generators', domains)

    cert = await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      meta
    )
  }

  if (cert === undefined) {
    throw new FeedbackError('Unable to find or generate requested certificate')
  }

  return { bundle: Buffer.from(await cert.getArchive()).toString('base64') }
}
