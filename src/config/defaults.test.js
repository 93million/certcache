/* global jest beforeEach test expect */

const fileExists = require('../lib/helpers/fileExists')

jest.mock('../lib/helpers/fileExists')

const defaults = require('./defaults')

const cahkeysExists = async (dir) => (dir === 'cahkeys')
const catkeysExists = async (dir) => (dir === 'catkeys')

beforeEach(() => {
  fileExists.mockReset()
})

test(
  'should find catkeys directory when catkeys exists and cahkeys does not',
  async () => {
    fileExists.mockImplementation(catkeysExists)

    await expect(defaults()).resolves.toMatchObject({ catKeysDir: 'catkeys' })
  }
)
test(
  'should find cahkeys directory when cahkeys exists and catkeys does not',
  async () => {
    fileExists.mockImplementation(cahkeysExists)

    await expect(defaults()).resolves.toMatchObject({ catKeysDir: 'cahkeys' })
  }
)
