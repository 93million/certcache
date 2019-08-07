const x509 = require('x509')

module.exports = (certPath) => {
  const {
    subject: {commonName},
    altNames,
    issuer: {commonName: issuerCommonName}
  } = x509.parseCert(certPath)

  return {altNames, certPath, commonName, issuerCommonName}
}
