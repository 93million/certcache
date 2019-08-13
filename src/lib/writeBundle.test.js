const writeBundle = require('./writeBundle')
const tar = require('tar')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')
const {Readable, Writable} = require('stream')
const config = require('../config')
const certName = 'testcert.pem'

jest.mock('tar')
jest.mock('./helpers/fileExists')
jest.mock('./helpers/mkdirRecursive')

beforeEach(() => {
  tar.x.mockReset()
  fileExists.mockReset()
  mkdirRecursive.mockReset()

  fileExists.mockImplementation(() => Promise.resolve(true))
  mkdirRecursive.mockImplementation(() => Promise.resolve())
  tar.x.mockImplementation(({cwd}) => new Writable({ write: () => {} }))
})

const decodedData = 'test cert data here'
const data = Buffer.from(decodedData).toString('base64')

test(
  'should pipe certificate data to tar for writing to fs',
  async () => {
    let tarInput = []
    const tarStream = new Writable({
      write: (chunk, encoding, callback) => {
        tarInput.push(chunk)
        callback()
      }
    })

    tar.x.mockImplementation(() => tarStream)

    const promise = new Promise((res) => {
      tarStream.on('finish', () => {
        res(tarInput.join(''))
      })
    })

    await writeBundle('/test/cert/dir', data)

    await expect(promise).resolves.toBe(decodedData)
  }
)

test(
  'should pass certificate path through to tar command',
  async () => {
    let tarCwd

    tar.x.mockImplementation(({cwd}) => {
      tarCwd = cwd

      return new Writable({ write: () => {} })
    })

    await writeBundle(`${config.certcacheCertDir}/${certName}`, data)

    expect(tarCwd).toBe(`${config.certcacheCertDir}/${certName}`)
  }
)

test(
  'create direrctory if it doesn\'t exist',
  async () => {
    fileExists.mockImplementation(() => Promise.resolve(false))

    await writeBundle(`${config.certcacheCertDir}/${certName}`, data)

    expect(mkdirRecursive)
      .toBeCalledWith(`${config.certcacheCertDir}/${certName}`)
  }
)
