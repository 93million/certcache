/* global jest test expect */

const fs = require('fs')
const getCertInfoFromPath = require('./getCertInfoFromPath')
const fileExists = require('./helpers/fileExists')
const getLocalCertificates = require('./getLocalCertificates')

jest.mock('fs')
jest.mock('./getCertInfoFromPath')
jest.mock('./helpers/fileExists')

const certDir = '/test/certs'
const certDirItems = ['cert1', 'cert2', 'cert3', 'README.txt']
const filePaths = [
  `${certDir}/cert1/cert.pem`,
  `${certDir}/cert2/cert.pem`,
  `${certDir}/cert3/cert.pem`,
  `${certDir}/README.txt`
]

fs.readdir.mockImplementation((path, callback) => {
  callback(
    (path === certDir)
      ? null
      : { ...new Error(`ENOENT not found ${path}`) },
    (path === certDir) ? certDirItems : undefined
  )
})

const mockCert = { _test_: 58008 }

getCertInfoFromPath.mockReturnValue(Promise.resolve(mockCert))
fileExists.mockImplementation((path) => filePaths.includes(path))

test('should get local certificates', async () => {
  const expected = [
    { ...mockCert, certPath: `${certDir}/cert1/cert.pem` },
    { ...mockCert, certPath: `${certDir}/cert2/cert.pem` },
    { ...mockCert, certPath: `${certDir}/cert3/cert.pem` }
  ]

  const localCerts = getLocalCertificates(certDir)

  await expect(localCerts).resolves.toEqual(expected)
})

test(
  'should return a blank array when certificate diretcory doesn\'t exist',
  async () => {
    await expect(getLocalCertificates('/dir/that/doesnt/exist'))
      .resolves
      .toHaveLength(0)
  }
)
