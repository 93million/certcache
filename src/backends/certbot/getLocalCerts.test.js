/* global jest test expect */

const getLocalCerts = require('./getLocalCerts')
const fs = require('fs')
const fileExists = require('../../lib/helpers/fileExists')
const path = require('path')
const Certificate = require('../../lib/classes/Certificate')

jest.mock('fs')
jest.mock('../../lib/helpers/fileExists')
jest.mock('path')
jest.mock('../../lib/classes/Certificate')
jest.mock('../../lib/getConfig.js')

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
Certificate.fromPath
  .mockImplementation((handlers, path) => {
    return Promise.resolve({ handlers, path })
  })

fileExists.mockImplementation((path) => filePaths.includes(path))
const expectedHandler = {
  getLocalCerts: expect.any(Function),
  canGenerateDomains: expect.any(Function),
  generateCert: expect.any(Function),
  getBundle: expect.any(Function),
  getConfig: expect.any(Function),
  getExtras: expect.any(Function)
}

test(
  'should return an array of certificates',
  async () => {
    fs.readdir
      .mockImplementation((path, callback) => callback(null, dirContents))

    const received = await getLocalCerts()

    expect(received).toEqual([
      { handlers: expectedHandler, path: '/test/certs/cert1/cert.pem' },
      { handlers: expectedHandler, path: '/test/certs/cert2/cert.pem' },
      { handlers: expectedHandler, path: '/test/certs/cert3/cert.pem' }
    ])
  }
)

test(
  'should return an ampty array when directory doesn\'t exist',
  async () => {
    const error = {
      ...new Error(`ENOENT: no such file or directory, stat '${path}'`),
      code: 'ENOENT',
      path,
      syscall: 'stat'
    }

    fs.readdir
      .mockImplementation((path, callback) => callback(error, null))

    await expect(getLocalCerts()).resolves.toEqual([])
  }
)
