/* global jest test expect beforeEach */
const getLocalCerts = require('./getLocalCerts')
const CertFinder = require('./lib/CertFinder')
const Certificate = require('../../lib/classes/Certificate')
const fileExists = require('../../lib/helpers/fileExists')

jest.mock('./lib/CertFinder')
jest.mock('../../lib/classes/Certificate')
jest.mock('../../lib/helpers/fileExists')

const commonName = 'foo.example.com'
const altNames = ['foo.example.com', 'test.example.com']
const issuerCommonName = 'test issuer'
const notAfter = new Date('2019-09-27T21:55:39.114Z')
const notBefore = new Date('2019-06-27T21:55:39.114Z')
const certPath = '/path/to/test/cert'
const cert1 = {
  dnsNames: altNames,
  certPath,
  subject: { commonName },
  issuer: { commonName: issuerCommonName },
  validTo: notAfter.toISOString(),
  validFrom: notBefore.toISOString()
}

const mockBundle = {
  commonName,
  altNames,
  issuerCommonName,
  notAfter,
  notBefore,
  certPath
}
const mockGetCerts = jest.fn()

mockGetCerts.mockReturnValue([cert1])

CertFinder.mockImplementation(() => ({ getCerts: mockGetCerts }))
Certificate
  .mockImplementation((handlers, certInfo) => ({ handlers, certInfo }))

beforeEach(() => {
  fileExists.mockReset()
  fileExists.mockReturnValue(Promise.resolve(true))
})

test(
  'should return an array of certificates',
  async () => {
    await expect(getLocalCerts()).resolves.toEqual([{
      certInfo: mockBundle,
      handlers: expect.any(Object)
    }])
  }
)

test(
  'should return an emptry array when thirdparty certificate dir is missing',
  async () => {
    fileExists.mockReturnValue(Promise.resolve(false))

    await expect(getLocalCerts()).resolves.toHaveLength(0)
  }
)
