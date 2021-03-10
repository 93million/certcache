/* global test expect */

const getMetaFromCert = require('./getMetaFromCert')

const mockTestCert = { issuerCommonName: 'Fake LE Intermediate X1' }
const mockRealCert = { issuerCommonName: 'Let\'s Encrypt Authority X3' }
const mockTestMeta = { isTest: true, keyType: 'rsa' }
const mockRealMeta = { isTest: false, keyType: 'rsa' }

test(
  'should identify test certificate from certificate\'s isserCommonName',
  () => {
    expect(getMetaFromCert(mockTestCert)).toEqual(mockTestMeta)
    expect(getMetaFromCert(mockRealCert)).toEqual(mockRealMeta)
  }
)

test(
  'should identify ecdsa certs from certificate\'s asn1Curve',
  () => {
    expect(getMetaFromCert({
      ...mockRealCert,
      asn1Curve: 'secp384r1'
    }))
      .toMatchObject({
        ellipticCurve: 'secp384r1',
        keyType: 'ecdsa'
      })
  }
)

test(
  'should map ec curves',
  () => {
    expect(getMetaFromCert({
      ...mockRealCert,
      asn1Curve: 'prime256v1'
    }))
      .toMatchObject({
        ellipticCurve: 'secp256r1',
        keyType: 'ecdsa'
      })
  }
)
