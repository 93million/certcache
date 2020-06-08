/* global jest test expect */

const filterAsync = require('./filterAsync')

const testArr = [1, 2, 3, 4, 5]

test(
  'should filter results using an async function',
  async () => {
    const callback = (item) => Promise.resolve(item > 2)

    await expect(filterAsync(testArr, callback))
      .resolves
      .toEqual(testArr.slice(2))
  }
)

test(
  'should pass expected args to callback function',
  async () => {
    const callback = jest.fn()
    const index = 2
    const element = testArr[index]

    await filterAsync(testArr, callback)

    expect(callback.mock.calls[2]).toEqual([element, index, testArr])
  }
)
