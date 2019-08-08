const CertLocator = require('./CertLocator')
const CertList = require('./CertList')
const getCertInfo = require('../helpers/getCertInfo')

jest.mock('../helpers/getCertInfo')

const handlers = { getLocalCertPaths: jest.fn() }
const locatedCerts = ['/test/path/to/cert1.pem', '/test/path/to/cert2.pem']
const certLocator = new CertLocator(handlers)

handlers.getLocalCertPaths.mockReturnValue(Promise.resolve(locatedCerts))

beforeEach(() => {
  handlers.getLocalCertPaths.mockClear()
})

test(
  'returns an instance of CertList',
  async () => {
    await expect(certLocator.getLocalCerts()).resolves.toBeInstanceOf(CertList)
  }
)

test(
  'returns list with a length matching the number of certificates located',
  async () => {
    await expect(certLocator.getLocalCerts()).resolves.toHaveLength(2)
  }
)
