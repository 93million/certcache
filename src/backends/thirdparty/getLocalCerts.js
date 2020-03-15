const CertFinder = require('./lib/CertFinder')
const getConfig = require('../../lib/getConfig')
const Certificate = require('../../lib/classes/Certificate')
const fileExists = require('../../lib/helpers/fileExists')

let handlers

const getLocalCerts = async () => {
  if (handlers === undefined) {
    handlers = require('.')
  }

  const config = (await getConfig()).server.backends.thirdparty

  if (await fileExists(config.certDir) === false) {
    return []
  } else {
    const certFinder = new CertFinder(config.certDir)

    return (await certFinder.getCerts())
      .map((cert) => {
        const certInfo = {
          altNames: cert.dnsNames,
          certPath: cert.certPath,
          commonName: cert.subject.commonName,
          issuerCommonName: cert.issuer.commonName,
          notAfter: new Date(cert.validTo),
          notBefore: new Date(cert.validFrom)
        }

        return new Certificate(handlers, certInfo)
      })
  }
}

module.exports = getLocalCerts
