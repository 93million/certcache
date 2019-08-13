/* global jest test expect */

const getCertInfo = require('./getCertInfo')
const x509 = require('x509')

jest.mock('x509')

const mockedCert = {
  subject: { commonName: 'test.example.com' },
  altNames: [
    'test.example.com',
    'www1.test.example.com',
    'foo.test.example.com'
  ],
  issuer: { commonName: 'Jimmy the issuer' }
}
const certPath = '/test/cert/path'

x509.parseCert.mockReturnValue(mockedCert)

test(
  'should return information about certificate',
  () => {
    expect(getCertInfo(certPath)).toEqual({
      commonName: mockedCert.subject.commonName,
      altNames: mockedCert.altNames,
      issuerCommonName: mockedCert.issuer.commonName,
      certPath
    })
  }
)
