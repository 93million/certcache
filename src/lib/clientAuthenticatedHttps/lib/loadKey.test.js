/* global jest test expect */

const loadKey = require('./loadKey')
const tar = require('tar')
const fs = require('fs')
const rimraf = require('rimraf')

jest.mock('tar')
jest.mock('fs')
jest.mock('rimraf')

const tmpDir = '/test/tmp/dir'
const testKeyObj = {
  ca: 'test ca cert content',
  cert: 'test cert contents',
  key: 'test key contents'
}

tar.x.mockReturnValue(Promise.resolve(true))
fs.mkdtemp.mockImplementation((prefix, callback) => {
  callback(null, tmpDir)
})

rimraf.mockImplementation((path, callback) => {
  callback(null, true)
})

fs.readFile.mockImplementation((path, callback) => {
  const fileContentsMap = {
    [`${tmpDir}/ca-crt.pem`]: testKeyObj.ca,
    [`${tmpDir}/crt.pem`]: testKeyObj.cert,
    [`${tmpDir}/key.pem`]: testKeyObj.key
  }

  callback(null, fileContentsMap[path])
})

test(
  'removes any temp directories created',
  async () => {
    await loadKey()

    expect(rimraf).toBeCalledWith(tmpDir, expect.any(Function))
  }
)

test(
  'returns an object representing key',
  async () => {
    const keyObj = await loadKey()

    expect(keyObj).toEqual(testKeyObj)
  }
)
