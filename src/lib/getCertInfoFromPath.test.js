/* global jest test expect */

const getCertInfoFromPath = require('./getCertInfoFromPath')
const x509 = require('@fidm/x509')
const fs = require('fs')
const loadCert = require('./loadCert')

jest.mock('@fidm/x509')
jest.mock('fs')
jest.mock('./loadCert')

loadCert.mockReturnValue({})

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
    await expect(getCertInfoFromPath(certPath)).resolves.toEqual({
      altNames: mockCert.dnsNames,
      certPath,
      commonName: mockCert.subject.commonName,
      issuerCommonName: mockCert.issuer.commonName,
      notAfter: new Date(mockCert.validTo),
      notBefore: new Date(mockCert.validFrom)
    })
  }
)

test(
  'should include EC curve when present',
  async () => {
    const nistCurve = 'mockNistCurve'

    loadCert.mockReturnValueOnce({ nistCurve })
    await expect(getCertInfoFromPath(certPath))
      .resolves
      .toHaveProperty('nistCurve', nistCurve)
  }
)

test(
  'should not include EC curve when not present',
  async () => {
    await expect(getCertInfoFromPath(certPath))
      .resolves
      .toHaveProperty('nistCurve', undefined)
  }
)
