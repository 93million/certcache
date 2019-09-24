const fs = require('fs')
const util = require('util')
const { Certificate } = require('@fidm/x509')

const readFile = util.promisify(fs.readFile)

module.exports = async (certPath) => {
  const certData = await readFile(certPath)
  const cert = Certificate.fromPEM(certData)
  const {
    dnsNames: altNames,
    issuer: { commonName: issuerCommonName },
    validTo,
    validFrom,
    subject: { commonName }
  } = cert

  return {
    altNames,
    certPath,
    commonName,
    issuerCommonName,
    notAfter: new Date(validTo),
    notBefore: new Date(validFrom)
  }
}
