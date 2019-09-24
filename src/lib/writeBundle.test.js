/* global jest test expect beforeEach */

const writeBundle = require('./writeBundle')
const tar = require('tar-stream')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')
const { Writable } = require('stream')
const config = require('../config')
const certName = 'testcert.pem'
const fs = require('fs')
const zlib = require('zlib')

jest.mock('./helpers/fileExists')
jest.mock('./helpers/mkdirRecursive')
jest.mock('fs')

const mockFiles = {}

fs.createWriteStream.mockImplementation((path) => {
  const chunks = []
  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      chunks.push(chunk)
      callback()
    }
  })

  delete mockFiles[path]

  stream.on('finish', () => {
    mockFiles[path] = Buffer.concat(chunks)
  })

  return stream
})

const mockBundle = {
  'test-cert': Buffer.from('__test cert data__'),
  'test-ca': Buffer.from('__test ca data__'),
  'test-key': Buffer.from('__test key data__')
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
    await writeBundle('/test/cert/dir', await tarArchivePromise)

    expect(mockFiles).toEqual(
      Object.keys(mockBundle).reduce(
        (acc, key) => ({
          ...acc,
          [`/test/cert/dir/${key}`]: mockBundle[key]
        }),
        {}
      )
    )
  }
)

test(
  'create direrctory if it doesn\'t exist',
  async () => {
    fileExists.mockImplementation(() => Promise.resolve(false))

    await writeBundle(`${config.certcacheCertDir}/${certName}`, await tarArchivePromise)

    expect(mkdirRecursive)
      .toBeCalledWith(`${config.certcacheCertDir}/${certName}`)
  }
)
