/* global jest test expect */

const fs = require('fs')
const path = require('path')
const getExtensions = require('./getExtensions')
const requireModule = require('./helpers/requireModule')

jest.mock('fs')
jest.mock('./helpers/requireModule')

const mockDirContents = ['ext1', 'ext2', 'fileToIgnore']
const ext1 = { foo: 'baa' }
const ext2 = { baa: 'fee' }
const mockExtensions = { ext1, ext2 }
const extensionsDir = path.resolve(__dirname, '..', 'extensions')

requireModule.mockImplementation((_path) => {
  const key = Object.keys(mockExtensions).find((key) => {
    return (_path === path.resolve(extensionsDir, key))
  })

  return key && mockExtensions[key]
})

fs.readdir.mockImplementation((path, callback) => {
  callback(null, mockDirContents)
})

fs.stat.mockImplementation(async (_path, callback) => {
  callback(
    null,
    {
      isDirectory: () => {
        return (path.basename(_path).startsWith('file') === false)
      }
    }
  )
})

test(
  'should generate list of extensions from directory contents',
  async () => {
    await expect(getExtensions()).resolves.toEqual({
      ext1: { ...ext1, id: expect.any(String) },
      ext2: { ...ext2, id: expect.any(String) }
    })
  }
)

test(
  'should add generated id inside extension object',
  async () => {
    await expect(getExtensions()).resolves.toEqual({
      ext1: { ...ext1, id: 'ext1' },
      ext2: { ...ext2, id: 'ext2' }
    })
  }
)

test(
  'should only include items that are directories',
  async () => {
    await expect(getExtensions()).resolves.not.toHaveProperty('fileToIgnore')
  }
)

test(
  'should cache results',
  async () => {
    await getExtensions({ noCache: true })
    await getExtensions()

    expect(requireModule)
      .toHaveBeenCalledTimes(Object.keys(mockExtensions).length)
  }
)
