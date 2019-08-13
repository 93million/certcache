/* global jest test expect */

const fs = require('fs')
const fileExists = require('./fileExists')

jest.mock('fs')

const filePaths = ['/test/file/exists']

fs.stat.mockImplementation((path, callback) => {
  const pathExists = filePaths.includes(path)

  callback(
    pathExists
      ? null
      : {
        ...new Error(`ENOENT: no such file or directory, stat '${path}'`),
        code: 'ENOENT',
        path,
        syscall: 'stat'
      },
    pathExists ? { size: 123 } : undefined
  )
})

test(
  'should return a promise that resolves to true if file exists',
  async () => {
    await expect(fileExists('/test/file/exists')).resolves.toBe(true)
  }
)

test(
  'should return a promise that resolves to false if file doesn\'t exist',
  async () => {
    await expect(fileExists('/test/file/no/existy')).resolves.toBe(false)
  }
)
