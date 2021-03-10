const { Certificate } = require('@fidm/x509')
const loadCert = require('./loadCert')

module.exports = async (pem) => {
  const cert = Certificate.fromPEM(pem)

  const {
    dnsNames: altNames,
    issuer: { commonName: issuerCommonName },
    subject: { commonName },
    validFrom,
    validTo
  } = cert
  const { asn1Curve, nistCurve } = loadCert(pem)

  return {
    altNames,
    asn1Curve,
    commonName,
    issuerCommonName,
    nistCurve,
    notAfter: new Date(validTo),
    notBefore: new Date(validFrom)
  }
}
