/* global jest test expect */

const getBundle = require('./getBundle')
const fs = require('fs')

jest.mock('fs')

const mockCertContents = '_test_cert_'
const mockChainContents = '_test_chain_'
const mockPrivkeyContents = '_test_privkey_'
const mockCertObj = { certPath: '/test/path/to/cert.pem' }

fs.readFile.mockImplementation((path, callback) => {
  const fileContentsMap = {
    [`/test/path/to/cert.pem`]: mockCertContents,
    [`/test/path/to/chain.pem`]: mockChainContents,
    [`/test/path/to/privkey.pem`]: mockPrivkeyContents
  }

  callback(null, Promise.resolve(fileContentsMap[path]))
})

test(
  'should return an object based on file path',
  async () => {
    expect(await getBundle(mockCertObj)).toEqual({
      cert: mockCertContents,
      chain: mockChainContents,
      privkey: mockPrivkeyContents
    })
  }
)
