/* global jest test expect */

const getCertInfo = require('./getCertInfo')
const x509 = require('@fidm/x509')
const fs = require('fs')

jest.mock('@fidm/x509')
jest.mock('fs')

const mockCert = {
  subject: { commonName: 'test.example.com' },
  dnsNames: [
    'test.example.com',
    'www1.test.example.com',
    'foo.test.example.com'
  ],
  issuer: { commonName: 'Jimmy the issuer' },
  validTo: new Date().toISOString(),
  validFrom: new Date().toISOString()
}
const certPath = '/test/cert/path'

x509.Certificate.fromPEM.mockReturnValue(mockCert)
fs.readFile.mockImplementation((path, callback) => {
  callback(null, 'mockedCertFileContents')
})

test(
  'should return information about certificate',
  async () => {
    await expect(getCertInfo(certPath)).resolves.toEqual({
      commonName: mockCert.subject.commonName,
      altNames: mockCert.dnsNames,
      issuerCommonName: mockCert.issuer.commonName,
      certPath,
      notAfter: new Date(mockCert.validTo),
      notBefore: new Date(mockCert.validFrom)
    })
  }
)
