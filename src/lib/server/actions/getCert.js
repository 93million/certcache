const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')('certcache:server/actions/getCert')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const arrayItemsMatch = require('../../helpers/arrayItemsMatch')
const getExtensionsForDomains = require('../../getExtensionsForDomains')
const getConfig = require('../../getConfig')

const checkRestrictions = async (clientName, domains) => {
  const config = await getConfig()

  if (
    config.server.clientRestrictions !== undefined &&
    clientPermittedAccessToCerts(
      config.server.clientRestrictions,
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
      const filterCert = (certLocator.filterCert !== undefined)
        ? certLocator.filterCert({
          commonName,
          altNames,
          meta: meta[certLocator.id] || {}
        })
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
