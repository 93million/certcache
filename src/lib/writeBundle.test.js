/* global jest test expect beforeEach */

const writeBundle = require('./writeBundle')
const tar = require('tar-stream')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')
const { Readable, Writable } = require('stream')
const fs = require('fs')
const zlib = require('zlib')
const path = require('path')
const setAndDemandDirPerms = require('./helpers/setAndDemandDirPerms')
const getConfig = require('./getConfig')

jest.mock('./helpers/fileExists')
jest.mock('./helpers/mkdirRecursive')
jest.mock('fs')
jest.mock('./helpers/setAndDemandDirPerms')
jest.mock('./getConfig')

const mockFiles = {}
const mockCertDir = '/test/cert/dir'

setAndDemandDirPerms.mockReturnValue(Promise.resolve())

fs.chmod.mockImplementation((path, mode, callback) => { callback(null) })

fs.createWriteStream.mockImplementation((path, options = {}) => {
  const chunks = []
  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      chunks.push(chunk)
      callback()
    }
  })

  stream.on('finish', () => {
    const buffer = (options.flags === 'a')
      ? Buffer.concat([mockFiles[path], Buffer.concat(chunks)])
      : Buffer.concat(chunks)

    mockFiles[path] = buffer
  })

  return stream
})

fs.createReadStream.mockImplementation((filePath) => {
  const stream = new Readable({
    read: () => {}
  })

  stream.push(mockBundle[path.basename(filePath)])
  stream.push(null)

  return stream
})

const mockBundle = {
  'cert.pem': Buffer.from('__test cert data__'),
  'chain.pem': Buffer.from('__test ca data__'),
  'privkey.pem': Buffer.from('__test key data__')
}
const mockTarChunks = []
const pack = tar.pack()
const mockTarStream = new Writable({
  write: (chunk, encoding, callback) => {
    mockTarChunks.push(chunk)
    callback()
  }
})

Object.keys(mockBundle).forEach((name) => {
  pack.entry({ name }, mockBundle[name])
})

pack.finalize()

const tarArchivePromise = new Promise((resolve, reject) => {
  mockTarStream.on('finish', () => {
    resolve(Buffer.concat(mockTarChunks))
  })
  pack.on('error', reject)
  mockTarStream.on('error', reject)
  pack.pipe(zlib.createGzip()).pipe(mockTarStream)
})

beforeEach(() => {
  mkdirRecursive.mockReset()
  fileExists.mockImplementation(() => Promise.resolve(true))
  fileExists.mockReset()
  mkdirRecursive.mockImplementation(() => Promise.resolve())
})

test(
  'should write the archive to the fs',
  async () => {
    await writeBundle(mockCertDir, await tarArchivePromise)

    expect(mockFiles).toEqual(
      Object.keys(mockBundle).reduce(
        (acc, key) => ({
          ...acc,
          [`${mockCertDir}/${key}`]: mockBundle[key]
        }),
        {
          [`${mockCertDir}/fullchain.pem`]: Buffer.concat([
            mockBundle['cert.pem'],
            mockBundle['chain.pem']
          ])
        }
      )
    )
  }
)

test(
  'create direrctory if it doesn\'t exist',
  async () => {
    const mockCertPath = '/path/to/cert'

    fileExists.mockImplementation(() => Promise.resolve(false))

    await writeBundle(mockCertPath, await tarArchivePromise)

    expect(mkdirRecursive).toBeCalledWith(mockCertPath)
  }
)

test(
  'should set file permissions',
  async () => {
    const mockCertPath = '/path/to/cert'

    fileExists.mockImplementation(() => Promise.resolve(false))

    await writeBundle(mockCertPath, await tarArchivePromise)

    expect(fs.chmod).toBeCalledWith(
      path.resolve(mockCertPath, 'privkey.pem'),
      0o600,
      expect.any(Function)
    )
  }
)

test(
  'should test file permissions',
  async () => {
    const mockCertPath = '/path/to/cert'

    await writeBundle(mockCertPath, await tarArchivePromise)

    expect(setAndDemandDirPerms).toBeCalledTimes(1)
  }
)

test(
  'should skip file permissions when required',
  async () => {
    const mockCertPath = '/path/to/cert'

    getConfig.mockReturnValueOnce({
      ...(await getConfig()),
      skipFilePerms: true
    })

    await writeBundle(mockCertPath, await tarArchivePromise)

    expect(setAndDemandDirPerms).not.toBeCalled()
  }
)
