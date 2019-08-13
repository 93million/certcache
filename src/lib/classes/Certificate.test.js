const getCertInfo = require('../getCertInfo')
const fs = require('fs')
const Certificate = require('./Certificate')
const tar = require('tar')
const {Readable} = require('stream')
const rimraf = require('rimraf')

jest.mock('../getCertInfo')
jest.mock('tar')
jest.mock('fs')
jest.mock('rimraf')

const testProp = 'foo123'
const handlers = { getFilesForBundle: jest.fn() }
const mockedFilesForBundle = {
  cert: '/test/crt.cer',
  chain: '/test/intr.pem',
  privkey: '/test/key.priv'
}
const tmpDir = '/test/tmp/dir'

let mockedTarCreateStream

handlers.getFilesForBundle.mockReturnValue(mockedFilesForBundle)
tar.c.mockImplementation(() => Promise.resolve(mockedTarCreateStream))
fs.copyFile.mockImplementation((src, dest, callback) => {callback(null, true)})
fs.appendFile.mockImplementation((file, contents, callback) => {
  callback(null, true)
})
fs.readFile.mockImplementation((path, callback) => {callback(null, true)})
fs.mkdtemp.mockImplementation((path, callback) => {
  callback(null, tmpDir)
})
rimraf.mockImplementation((path, callback) => {callback(null, true)})

getCertInfo.mockReturnValue({testProp})

const certPath = '/test/crt.cer'

beforeEach(() => {
  mockedTarCreateStream = new Readable()

  mockedTarCreateStream.push('sample tar data')
  mockedTarCreateStream.push(null)

  tar.c.mockClear()
})

describe('creates an archive', () => {
  test(
    'creates temp folder',
    async () => {
      const cert = new Certificate(handlers, certPath)

      await cert.getArchive()

      expect(fs.mkdtemp.mock.calls[0][0]).toContain('com.93million')
    }
  )

  test(
    'copies files to temp folder',
    async () => {
      const cert = new Certificate(handlers, certPath)

      await cert.getArchive()

      expect(fs.copyFile).toBeCalledWith(
        mockedFilesForBundle.chain,
        `${tmpDir}/chain.pem`,
        expect.any(Function)
      )
      expect(fs.copyFile).toBeCalledWith(
        mockedFilesForBundle.cert,
        `${tmpDir}/fullchain.pem`,
        expect.any(Function)
      )
      expect(fs.copyFile).toBeCalledWith(
        mockedFilesForBundle.privkey,
        `${tmpDir}/privkey.pem`,
        expect.any(Function)
      )
    }
  )

  test(
    'creates tar archive of certificate directory',
    async () => {
      const cert = new Certificate(handlers, certPath)

      await cert.getArchive()

      expect(tar.c).toBeCalledTimes(1)
    }
  )

  test(
    'deletes temp folder',
    async () => {
      const cert = new Certificate(handlers, certPath)

      await cert.getArchive()

      expect(rimraf).toBeCalledWith(tmpDir, expect.any(Function))
    }
  )
})

test(
  'makes properties of getCertInfo available to be consumed',
  () => {
    const cert = new Certificate(handlers, certPath)

    expect(cert.testProp).toBe(testProp)
  }
)
