/* global jest test expect */

const mkdirRecursive = require('./mkdirRecursive')
const fs = require('fs')
const fileExists = require('./fileExists')

jest.mock('fs')
jest.mock('./fileExists')

test(
  'should call mkdir recursively until all missing directories are created',
  async () => {
    const dirList = [
      '/',
      '/dir1',
      '/dir1/subdir1',
      '/dir1/subdir2'
    ]

    fileExists.mockImplementation(async (path) => {
      return dirList.includes(path)
    })

    fs.mkdir.mockImplementation((path, callback) => {
      const dirList = path.split('/')
      const parentDir = dirList.slice(0, dirList.length - 1).join('/')
      const parentDirExists = fileExists(parentDir)

      callback(
        parentDirExists
          ? null
          : {
            ...new Error(`ENOENT: no such file or directory, mkdir '${path}'`),
            code: 'ENOENT',
            path,
            syscall: 'stat'
          },
        parentDirExists ? true : undefined
      )
    })

    await mkdirRecursive('/dir1/subdir2/test123/test456')

    expect(fs.mkdir.mock.calls).toEqual([
      ['/dir1/subdir2/test123', expect.any(Function)],
      ['/dir1/subdir2/test123/test456', expect.any(Function)]
    ])
  }
)
