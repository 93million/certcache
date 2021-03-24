const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')('certcache:server/actions/getCert')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const arrayItemsMatch = require('../../helpers/arrayItemsMatch')
const getExtensionsForDomains = require('../../getExtensionsForDomains')
const getConfig = require('../../getConfig')
const metaItemsMatch = require('../../helpers/metaItemsMatch')
const normalizeMeta = require('../../normalizeMeta')
const getMetaFromCert =
  require('../../getMetaFromExtensionFunction')('getMetaFromCert')

const checkRestrictions = async (clientName, domains) => {
  const config = await getConfig()

  if (
    config.server.domainAccess !== undefined &&
    clientPermittedAccessToCerts(
      config.server.domainAccess,
      clientName,
      domains
    ) === false
  ) {
    throw new FeedbackError([
      'Client',
      clientName,
      'does not have permission to generate the requested certs'
    ].join(' '))
  }
}

const findLocalCertFromExtensions = async (
  extensions,
  commonName,
  altNames,
  meta,
  days
) => {
  const certRenewDate = new Date()

  certRenewDate.setDate(certRenewDate.getDate() + days)

  const localCertSearch = await Promise.all(extensions.map(
    async (certLocator) => {
      const localCerts = await certLocator.getLocalCerts()

      localCerts.sort((a, b) => {
        return (a.notAfter.getTime() > b.notAfter.getTime()) ? -1 : 1
      })

      const matchingCertsIndex = (
        await Promise.all(localCerts.map(async (cert) => {
          const {
            altNames: certAltNames,
            commonName: certCommonName,
            notAfter: certNotAfter
          } = cert
          const certMeta = await getMetaFromCert(cert)

          return (
            certCommonName === commonName &&
            (
              arrayItemsMatch(certAltNames, altNames) ||
              (certAltNames.length === 0 && altNames.length === 1)
            ) &&
            certNotAfter.getTime() > certRenewDate.getTime() &&
            metaItemsMatch(certMeta[certLocator.id], meta[certLocator.id])
          )
        }))
      )
        .findIndex((isFound) => isFound)

      return localCerts[matchingCertsIndex]
    }
  ))

  return localCertSearch.find((localCert) => (localCert !== undefined))
}

module.exports = async (payload, { clientName } = {}) => {
  const config = await getConfig()
  const { domains, days = config.renewalDays } = payload
  const meta = await normalizeMeta(payload.meta)
  const commonName = domains[0]
  const altNames = domains

  if (clientName !== undefined) {
    await checkRestrictions(clientName, domains)
  }

  debug('Request for certificate', domains, 'meta', meta)

  const extensions = await getExtensionsForDomains(domains)

  let cert = await findLocalCertFromExtensions(
    extensions,
    commonName,
    altNames,
    meta,
    days
  )

  if (cert === undefined) {
    debug('No local certificate found - executing cert generators', domains)

    cert = await generateFirstCertInSequence(
      extensions,
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
