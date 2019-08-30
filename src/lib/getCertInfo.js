const x509 = require('x509')

module.exports = (certPath) => {
  const {
    altNames,
    issuer: { commonName: issuerCommonName },
    notAfter,
    notBefore,
    subject: { commonName }
  } = x509.parseCert(certPath)

  return {
    altNames,
    certPath,
    commonName,
    issuerCommonName,
    notAfter,
    notBefore
  }
}
