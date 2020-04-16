/* global jest test expect */

const getCertLocators = require('./getCertLocators')
const getExtensions = require('./getExtensions')

jest.mock('./getExtensions')

const mockExtensions = { testExt1: 'abc', testExt2: 'def' }

getExtensions.mockReturnValue(Promise.resolve(mockExtensions))

test(
  'should return array of cert locators',
  async () => {
    await expect(getCertLocators())
      .resolves
      .toEqual(Object.values(mockExtensions))
  }
)
