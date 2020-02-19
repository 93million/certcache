const CertFinder = require('./lib/CertFinder')
const config = require('../../config')
const Certificate = require('../../lib/classes/Certificate')
const fileExists = require('../../lib/helpers/fileExists')

const getLocalCerts = async () => {
  if (await fileExists(config.thirdpartyDir) === false) {
    return []
  } else {
    const certFinder = new CertFinder(config.thirdpartyDir)

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

const handlers = {
  getBundle: require('./getBundle'),
  getLocalCerts
}

module.exports = getLocalCerts
