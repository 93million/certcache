/* global jest test expect */

const readdirRecursive = require('./readdirRecursive')
const fs = require('fs')

const filePaths = [
  '/',
  '/testdir/',
  '/testdir/file1',
  '/testdir/file2',
  '/testdir/dir1/',
  '/testdir/dir1/file1',
  '/testdir/dir1/file2',
  '/testdir/dir1/dir2/',
  '/testdir/dir1/dir2/file3',
  '/testdir/dir1/dir2/file4',
  '/otherdir/',
  '/otherdir/otherfile1',
  '/otherdir/otherfile2'
]

jest.mock('fs')

const stripSlashes = (path) => path.replace(/\/+$/, '')

fs.readdir.mockImplementation((path, callback) => {
  // remove trailing slashes
  path = stripSlashes(path)

  const pathComponents = path.split('/')

  callback(
    null,
    filePaths
      .filter((filePath) => {
        filePath = stripSlashes(filePath)
        const filePathComponents = filePath.split('/')

        return (
          filePath.startsWith(`${path}/`) &&
          filePathComponents.length === pathComponents.length + 1
        )
      })
      .map((path) => {
        if (path.endsWith('/')) {
          path = path = stripSlashes(path)
        }

        const pathComponents = path.split('/')

        return pathComponents[pathComponents.length - 1]
      })
  )
})

fs.stat.mockImplementation((path, callback) => {
  return callback(
    null,
    {
      isDirectory: () => {
        return filePaths.includes(`${path}/`)
      }
    }
  )
})

test(
  'should return a list of file paths',
  async () => {
    const filePath = '/testdir/'
    const pathRegexp = new RegExp(`^${filePath}[^/]+`)

    await expect(readdirRecursive(filePath))
      .resolves
      .toEqual(
        filePaths
          .filter((path) => pathRegexp.test(path))
          .map(stripSlashes)
      )
  }
)
