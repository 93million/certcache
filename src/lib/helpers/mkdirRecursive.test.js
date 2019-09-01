/* global jest test expect beforeEach */

const mkdirRecursive = require('./mkdirRecursive')
const fs = require('fs')
const fileExists = require('./fileExists')

jest.mock('fs')
jest.mock('./fileExists')

let dirList

fileExists.mockImplementation((path) => dirList.includes(path))

fs.mkdir.mockImplementation((path, callback) => {
  const dirPath = path.split('/')
  dirPath.shift()

  const parentDir = `/${dirPath.slice(0, dirPath.length - 1).join('/')}`
  const parentDirExists = dirList.includes(parentDir)
  let err

  if (parentDirExists === false) {
    err = new Error(`ENOENT: no such file or directory, mkdir '${path}'`)
    err.code = 'ENOENT'
    err.path = parentDir
    err.syscall = 'stat'
  } else if (dirList.includes(path)) {
    err = new Error(`EEXIST: file already exists, mkdir '${path}'`)
    err.code = 'EEXIST'
    err.path = path
    err.syscall = 'mkdir'
  } else {
    dirList.push(path)
  }

  callback(
    (err === undefined) ? null : err,
    parentDirExists ? true : undefined
  )
})

beforeEach(() => {
  fs.mkdir.mockClear()

  dirList = [
    '/',
    '/dir1',
    '/dir1/subdir1',
    '/dir1/subdir2'
  ]
})

test(
  'should call mkdir recursively until all missing directories are created',
  async () => {
    await mkdirRecursive('/dir1/subdir2/test123/test456')

    expect(fs.mkdir.mock.calls).toEqual([
      ['/dir1/subdir2/test123', expect.any(Function)],
      ['/dir1/subdir2/test123/test456', expect.any(Function)]
    ])
  }
)

test(
  'should catch file exists (EEXIST) errors when calling mkdir',
  async () => {
    fileExists.mockImplementation((path) => false)

    await expect(mkdirRecursive('/dir1/subdir2/test123/test456'))
      .resolves
      .not
      .toThrow()
  }
)

test(
  'should not catch errors other than file exists (EEXIST) when calling mkdir',
  async () => {
    fileExists
      .mockImplementation((path) => path !== '/dir1/subdir2/test123/test456')

    await expect(mkdirRecursive('/dir1/subdir2/test123/test456'))
      .rejects
      .toThrow()
  }
)
