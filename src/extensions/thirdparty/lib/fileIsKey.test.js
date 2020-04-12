/* global jest test expect */

const fileIsKey = require('./fileIsKey')
const readFirstLine = require('./readFirstLine')

jest.mock('./readFirstLine')

const filePaths = [
  {
    path: '/test/path/test.key',
    firstLine: '-----BEGIN RSA PRIVATE KEY-----'
  },
  {
    path: '/test/path/key.pem',
    firstLine: '-----BEGIN RSA PRIVATE KEY-----'
  },
  {
    path: '/test/path/cert.pem',
    firstLine: '-----BEGIN CERTIFICATE-----'
  },
  {
    path: '/test/path/valid-cert-with-bad-extension.jpg',
    firstLine: '-----BEGIN RSA PRIVATE KEY-----'
  },
  {
    path: '/test/path/invalid-key.pem',
    firstLine: 'this file is not a pem'
  }
]

readFirstLine.mockImplementation((filePath) => {
  return filePaths.find(({ path }) => (path === filePath)).firstLine
})

test(
  'should test files ending with recognised extensions',
  async () => {
    await expect(fileIsKey('/test/path/test.key')).resolves.toBe(true)
    await expect(fileIsKey('/test/path/key.pem')).resolves.toBe(true)
  }
)

test(
  'should not test files with unrecognised extensions',
  async () => {
    await expect(fileIsKey('/test/path/valid-cert-with-bad-extension.jpg'))
      .resolves
      .toBe(false)
  }
)

test(
  'should search first line of file to see if it is a certificate',
  async () => {
    await expect(fileIsKey('/test/path/key.pem')).resolves.toBe(true)
    await expect(fileIsKey('/test/path/invalid-key.pem')).resolves.toBe(false)
  }
)
