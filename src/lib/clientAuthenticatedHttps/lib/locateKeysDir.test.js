/* global jest test expect */

const locateKeysDir = require('./locateKeysDir')
const path = require('path')
const fileExists = require('./fileExists')

const cahKeysPath = '/test/dir/dir1/cahkeys'
const scriptPath = '/test/dir/dir1/dir2/script'
const filePaths = [
  '/',
  '/test',
  '/test/dir',
  '/test/dir/file1',
  '/test/dir/dir1',
  cahKeysPath,
  '/test/dir/dir1/file1',
  '/test/dir/dir1/dir2',
  scriptPath
]

jest.mock('path')
jest.mock('./fileExists')

path.dirname.mockReturnValue(scriptPath)
fileExists.mockImplementation((path) => filePaths.includes(path))

test(
  'should locate directory containing cahkeys',
  async () => {
    await expect(locateKeysDir()).resolves.toBe(cahKeysPath)
  }
)
