/* global jest test expect */

const getBundle = require('./getBundle')
const CertFinder = require('./lib/CertFinder')

jest.mock('./lib/CertFinder')
jest.mock('../../lib/getConfig')

const mockCertContents = '_test_cert_'
const mockChainContents = ['_test_chain_1', '_test_chain_2']
const mockPrivkeyContents = '_test_privkey_'
const commonName = 'test.93million.com'
const altNames = ['test.93million.com', 'www.93million.com', 'foo.93million.com']
const issuerCommonName = 'Test Cert Issuer'
const mockCertObj = { commonName, altNames, issuerCommonName }

const mockGetCert = jest.fn()
const mockGetChain = jest.fn()
const mockGetKey = jest.fn()

mockGetCert.mockReturnValue(Promise.resolve({
  pem: mockCertContents
}))
mockGetChain.mockReturnValue(Promise.resolve(
  mockChainContents.map((cert) => ({ pem: cert }))
))
mockGetKey.mockReturnValue(Promise.resolve({
  toPEM: () => mockPrivkeyContents
}))

CertFinder.mockImplementation(() => {
  return {
    getCert: mockGetCert,
    getChain: mockGetChain,
    getKey: mockGetKey
  }
})

test(
  'should return an object based on values returned from CertFinder',
  async () => {
    expect(await getBundle(mockCertObj)).toEqual({
      cert: mockCertContents,
      chain: mockChainContents.join(''),
      privkey: mockPrivkeyContents
    })
  }
)
