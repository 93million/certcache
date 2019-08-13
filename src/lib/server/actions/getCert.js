const generators = require('../../../config/generators')
const locators = require('../../../config/locators')
const generateFirstCertInSequence = require(
  '../../generateFirstCertInSequence'
)
const CertLocator = require('../../classes/CertLocator')
const CertGenerator = require('../../classes/CertGenerator')
const backends = require('../../plugins')
const config = require('../../../config')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')

module.exports = async (payload) => {
  const {isTest, domains} = payload
  const extras = {isTest}
  const [commonName, ...altNames] = domains

  debug('Request for certificate', domains, 'with extras', extras)

  altNames.push(commonName)

  const certLocators = locators.map((key) => new CertLocator(backends[key]))
  const certGenerators = generators
    .map((key) => new CertGenerator(backends[key]))

  const localCertSearch = await Promise
    .all(certLocators.map(
      async (certLocator) => (await certLocator.getLocalCerts())
        .findCert(commonName, altNames, extras)
    ))

  localCert = localCertSearch.find((localCert) => localCert !== undefined)

  if (localCert !== undefined) {
    debug('Found matching cert locally')
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

  return {bundle: Buffer.from(await cert.getArchive()).toString('base64')}
}
