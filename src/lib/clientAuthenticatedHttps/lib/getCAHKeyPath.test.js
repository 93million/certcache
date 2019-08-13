/* global jest test expect beforeEach */

const getCAHKeyPath = require('./getCAHKeyPath')
const locateKeysDir = require('./locateKeysDir')
const fs = require('fs')

const cahKey = 'testkey'
const dirKeyFileName = 'testclient.cahkey'
const cahKeyDir = '/test/cahkeys/dir'
const mockDirList = ['server.cahkey', dirKeyFileName]

jest.mock('./locateKeysDir')
jest.mock('fs')

locateKeysDir.mockReturnValue(Promise.resolve(cahKeyDir))

beforeEach(() => {
  locateKeysDir.mockClear()
  delete process.env.CAH_KEY_NAME
  fs.readdir.mockImplementation((path, callback) => {
    callback(null, mockDirList)
  })
})

test(
  'should return path to key when supplied as argument',
  async () => {
    await expect(getCAHKeyPath(cahKey))
      .resolves.toBe(`${cahKeyDir}/${cahKey}.cahkey`)
  }
)

test(
  'should return path to key when present in env var',
  async () => {
    const cahKey = 'testkey-env'

    process.env.CAH_KEY_NAME = cahKey

    await expect(getCAHKeyPath())
      .resolves.toBe(`${cahKeyDir}/${cahKey}.cahkey`)
  }
)

test(
  'should choose key if there is only one key in the keys dir (other than server)',
  async () => {
    await expect(getCAHKeyPath()).resolves.toBe(`${cahKeyDir}/${dirKeyFileName}`)
  }
)

test(
  'should throw error when no cert dir is specified and more than 2 files are present in directory',
  async () => {
    fs.readdir.mockImplementation((path, callback) => {
      callback(null, [...mockDirList, 'extra.client.cahkey'])
    })

    await expect(getCAHKeyPath()).rejects.toThrowError()
  }
)
