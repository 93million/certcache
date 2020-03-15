/* global jest describe test expect */

const getCertInfo = require('../getCertInfo')
const Certificate = require('./Certificate')
const tar = require('tar-stream')
const { Readable } = require('stream')
const zlib = require('zlib')

jest.mock('../getCertInfo')
jest.mock('fs')
jest.mock('rimraf')

const testProp = 'foo123'
const mockHandlers = { getBundle: jest.fn() }
const certPath = '/test/crt.cer'
const mockBundle = {
  cert: Buffer.from('__mockCert__'),
  chain: Buffer.from('__mockChain__'),
  privkey: Buffer.from('_mockPrivkey__')
}

getCertInfo.mockReturnValue(Promise.resolve({ testProp }))
mockHandlers.getBundle.mockReturnValue(mockBundle)

describe('creates an archive', () => {
  test(
    'should return a tar archive of bundle as a buffer',
    async () => {
      const extract = tar.extract()
      const archiveStream = new Readable({ read: () => {} })
      const cert = await Certificate.fromPath(mockHandlers, certPath)
      const archive = await cert.getArchive()
      const expandedFiles = {}

      archiveStream.push(archive)
      archiveStream.push(null)

      extract.on('entry', ({ name }, stream, next) => {
        const chunks = []

        stream.on('data', (chunk) => {
          chunks.push(chunk)
        })

        stream.on('end', () => {
          expandedFiles[name] = Buffer.concat(chunks)
          next()
        })
      })

      const receivedExpandedFiles = await new Promise((resolve, reject) => {
        extract.on('finish', () => {
          resolve(expandedFiles)
        })

        archiveStream.pipe(zlib.createGunzip()).pipe(extract)
      })

      expect(receivedExpandedFiles).toEqual({
        'chain.pem': mockBundle.chain,
        'cert.pem': mockBundle.cert,
        'privkey.pem': mockBundle.privkey
      })
    }
  )
})

test(
  'makes properties of getCertInfo available to be consumed',
  async () => {
    const cert = await Certificate.fromPath(mockHandlers, certPath)

    expect(cert.testProp).toBe(testProp)
  }
)
