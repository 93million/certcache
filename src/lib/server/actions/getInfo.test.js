/* global test expect */

const getInfo = require('./getInfo')

test(
  'should output data to match snapshot',
  async () => {
    await expect(getInfo()).resolves.toMatchSnapshot()
  }
)
