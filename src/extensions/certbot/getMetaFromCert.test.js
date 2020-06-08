/* global test expect */

const getMetaFromCert = require('./getMetaFromCert')

const mockTestCert = { issuerCommonName: 'Fake LE Intermediate X1' }
const realTestCert = { issuerCommonName: 'Let\'s Encrypt Authority X3' }
const mockTestMeta = { isTest: true }
const mockRealMeta = { isTest: false }

test(
  'should identify test certificate from certificate\'s isserCommonName',
  () => {
    expect(getMetaFromCert(mockTestCert)).toEqual(mockTestMeta)
    expect(getMetaFromCert(realTestCert)).toEqual(mockRealMeta)
  }
)
