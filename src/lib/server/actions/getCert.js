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

const findLocatCert = async (commonName, altNames, isTest, days) => {
  const certLocators = await getCertLocators()
  const certRenewDate = new Date()

  certRenewDate.setDate(certRenewDate.getDate() + days)

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
            certNotAfter.getTime() > certRenewDate.getTime()
          )
        })

        return matchingCerts
      }
    ))

  return localCertSearch.find((localCert) => (localCert !== undefined))
}

module.exports = async (payload, { req }) => {
  const { isTest, domains, days = 30 } = payload
  const clientName = req.connection.getPeerCertificate().subject.CN
  const commonName = domains[0]
  const altNames = domains

  await checkRestrictions(clientName, domains)
  debug('Request for certificate', domains, 'is test', isTest)

  const certGenerators = await getCertGeneratorsForDomains(domains)

  let cert = await findLocatCert(commonName, altNames, isTest, days)

  if (cert === undefined) {
    debug('No local certificate found - executing cert generators', domains)

    cert = await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      { isTest }
    )
  }

  if (cert === undefined) {
    throw new FeedbackError('Unable to find or generate requested certificate')
  }

  return { bundle: Buffer.from(await cert.getArchive()).toString('base64') }
}
