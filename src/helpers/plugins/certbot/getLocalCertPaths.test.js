const getLocalCertPaths = require('./getLocalCertPaths')
const fs = require('fs')
const fileExists = require('../../fileExists')
const path = require('path')

jest.mock('fs')
jest.mock('../../fileExists')
jest.mock('path')

const dirContents = ['cert1', 'cert2', 'cert3']
const filePaths = [
  '/',
  '/test',
  '/test/certs',
  '/test/certs/cert1',
  '/test/certs/cert1/cert.pem',
  '/test/certs/cert2',
  '/test/certs/cert2/cert.pem',
  '/test/certs/cert3/',
  '/test/certs/cert3/cert.pem',
  '/test/certs/notcert1',
  '/test/certs/notcert1/file1',
  '/test/certs/notcert1/file2',
  '/test/certs/notcert2/file1',
  '/test/certs/notcert2/file2',
  '/test/certs/notcert2/file3'
]


path.resolve.mockReturnValue('/test/certs')

fileExists.mockImplementation(async (path) => await filePaths.includes(path))

test(
  'should return an array of paths to certs',
  async () => {
    fs.readdir
      .mockImplementation((path, callback) => callback(null, dirContents))

    await expect(getLocalCertPaths()).resolves.toEqual([
      '/test/certs/cert1/cert.pem',
      '/test/certs/cert2/cert.pem',
      '/test/certs/cert3/cert.pem'
    ])
  }
)

test(
  'should return an ampty array when directory doesn\'t exist',
  async () => {
    fs.readdir
      .mockImplementation((path, callback) => callback(
        {
          ...new Error(`ENOENT: no such file or directory, stat '${path}'`),
          code: 'ENOENT',
          path,
          syscall: 'stat'
        },
        null
      ))

    await expect(getLocalCertPaths()).resolves.toEqual([])
  }
)
