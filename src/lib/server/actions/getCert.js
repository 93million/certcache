const generators = require('../../../config/generators')
const locators = require('../../../config/locators')
const generateFirstCertInSequence = require(
  '../../generateFirstCertInSequence'
)
const CertLocator = require('../../classes/CertLocator')
const CertGenerator = require('../../classes/CertGenerator')
const backends = require('../../../backends')
const config = require('../../../config')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')('certcache:server/actions/getCert')
const yaml = require('yaml')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')

module.exports = async (payload, { req }) => {
  const { extras, domains } = payload
  const clientCertCommonName = req.connection.getPeerCertificate().subject.CN

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

  const [commonName, ...altNames] = domains

  debug('Request for certificate', domains, 'with extras', extras)

  altNames.unshift(commonName)

  const certLocators = locators.map((key) => new CertLocator(backends[key]))
  const certGenerators = generators
    .map((key) => new CertGenerator(backends[key]))

  const localCertSearch = await Promise
    .all(certLocators.map(
      async (certLocator) => {
        const localCerts = await certLocator.getLocalCerts()
        let matchingCerts = localCerts.findCert(commonName, altNames, extras)

        if (altNames.length === 1 && matchingCerts === undefined) {
          matchingCerts = localCerts.findCert(commonName, [], extras)
        }

        return matchingCerts
      }
    ))

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + config.renewDaysBefore)

  const localCert = localCertSearch.find((localCert) => (
    localCert !== undefined &&
    localCert.notAfter.getTime() >= certRenewEpoch.getTime()
  ))

  if (localCert !== undefined) {
    debug('Found matching cert locally', domains)
  } else {
    debug('No local certificate found - executing cert generators', domains)
  }

  const cert = (localCert !== undefined)
    ? localCert
    : (await generateFirstCertInSequence(
      certGenerators,
      commonName,
      altNames,
      extras,
      config
    ))

  if (cert === undefined) {
    throw new FeedbackError('Unable to generate cert using any backend')
  }

  return { bundle: Buffer.from(await cert.getArchive()).toString('base64') }
}
