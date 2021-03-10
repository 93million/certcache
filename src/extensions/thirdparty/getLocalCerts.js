const CertFinder = require('./lib/CertFinder')
const getConfig = require('../../lib/getConfig')
const Certificate = require('../../lib/classes/Certificate')
const fileExists = require('../../lib/helpers/fileExists')
const getCertInfoFromPem = require('../../lib/getCertInfoFromPem')

let handlers

const getLocalCerts = async () => {
  if (handlers === undefined) {
    handlers = require('.')
  }

  const config = (await getConfig()).extensions.thirdparty

  if (await fileExists(config.certDir) === false) {
    return []
  } else {
    const certFinder = new CertFinder(config.certDir)

    return Promise.all(
      (await certFinder.getCerts()).map(async (cert) => {
        const certInfo = {
          ...await getCertInfoFromPem(cert.pem),
          certPath: cert.certPath
        }

        return new Certificate(handlers, certInfo)
      })
    )
  }
}

module.exports = getLocalCerts
