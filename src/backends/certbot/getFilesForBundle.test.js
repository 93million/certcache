/* global test expect */

const getFilesForBundle = require('./getFilesForBundle')
const path = require('path')

test(
  'should return an object based on file path',
  () => {
    const certPath = '/test/path/to/cert.pem'
    const filesForBundle = getFilesForBundle(certPath)
    const certDirname = path.dirname(certPath)

    expect(filesForBundle).toEqual({
      cert: `${certDirname}/cert.pem`,
      chain: `${certDirname}/chain.pem`,
      privkey: `${certDirname}/privkey.pem`
    })
  }
)
