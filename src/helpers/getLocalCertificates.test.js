const fs = require('fs')
const x509 = require('x509')
const fileExists = require('./fileExists')
const getLocalCertificates = require('./getLocalCertificates')

jest.mock('fs')
jest.mock('x509')
jest.mock('./fileExists')

test('should get local certificates', async () => {
  const certDir = '/test/certs/'
  const certDirItems = ['cert1', 'cert2', 'cert3', 'README.txt']
  const filePaths = [
    `${certDir}cert1/cert.pem`,
    `${certDir}cert2/cert.pem`,
    `${certDir}cert3/cert.pem`,
    `${certDir}README.txt`
  ]

  fs.readdir.mockImplementation((path, callback) => {
    callback(null, certDirItems)
  })

  const mockCert = {_test_: 58008}

  x509.parseCert.mockReturnValue(mockCert)
  fileExists.mockImplementation((path) => filePaths.includes(path))

  const expected = [
    {...mockCert, certPath: `${certDir}cert1`},
    {...mockCert, certPath: `${certDir}cert2`},
    {...mockCert, certPath: `${certDir}cert3`}
  ]

  expect(await getLocalCertificates(certDir)).toEqual(expected)
})
