const fs = require('fs')
const getCertInfo = require('./getCertInfo')
const fileExists = require('./fileExists')
const getLocalCertificates = require('./getLocalCertificates')

jest.mock('fs')
jest.mock('./getCertInfo')
jest.mock('./fileExists')

const certDir = '/test/certs/'
const certDirItems = ['cert1', 'cert2', 'cert3', 'README.txt']
const filePaths = [
  `${certDir}cert1/cert.pem`,
  `${certDir}cert2/cert.pem`,
  `${certDir}cert3/cert.pem`,
  `${certDir}README.txt`
]

fs.readdir.mockImplementation((path, callback) => {
    callback(
      (path === certDir)
        ? null
        : {...new Error(`ENOENT not found ${path}`)},
      (path === certDir) ? certDirItems : undefined
    )
})

const mockCert = {_test_: 58008}

getCertInfo.mockReturnValue(mockCert)
fileExists.mockImplementation((path) => filePaths.includes(path))

test('should get local certificates', async () => {
  const expected = [
    {...mockCert, certPath: `${certDir}cert1/cert.pem`},
    {...mockCert, certPath: `${certDir}cert2/cert.pem`},
    {...mockCert, certPath: `${certDir}cert3/cert.pem`}
  ]

  await expect(getLocalCertificates(certDir)).resolves.toEqual(expected)
})

test(
  'should return a blank array when certificate diretcory doesn\'t exist',
  async () => {
    await expect(getLocalCertificates('/dir/that/doesnt/exist')).resolves.toHaveLength(0)
  }
)
