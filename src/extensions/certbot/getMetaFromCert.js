module.exports = ({ asn1Curve, issuerCommonName }) => {
  /* curveMaps sourced from https://tools.ietf.org/search/rfc4492#page-32
     see 'Appendix A.  Equivalent Curves (Informative)' */
  const curveMaps = {
    prime192v1: 'secp192r1',
    prime256v1: 'secp256r1'
  }
  const curve = (curveMaps[asn1Curve] !== undefined)
    ? curveMaps[asn1Curve]
    : asn1Curve

  return {
    ellipticCurve: curve,
    isTest: (
      issuerCommonName.startsWith('Fake LE ') ||
      issuerCommonName.startsWith('(STAGING)')
    ),
    keyType: (asn1Curve !== undefined) ? 'ecdsa' : 'rsa'
  }
}
