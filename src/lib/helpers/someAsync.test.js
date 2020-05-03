/* global jest test expect */
const someAsync = require('./someAsync')

const testArr = [1, 2, 3, 4]

test(
  'should return true when callback returns true for 1 or more items',
  async () => {
    const callback = (item) => Promise.resolve(item === 3)

    expect(await someAsync(testArr, callback)).toBe(true)
  }
)

test(
  'should return false when callback returns false for all items',
  async () => {
    const callback = (item) => Promise.resolve(item === 5)

    expect(await someAsync(testArr, callback)).toBe(false)
  }
)

test(
  'should pass expected args to callback function',
  async () => {
    const callback = jest.fn()
    const index = 2
    const element = testArr[index]

    await someAsync(testArr, callback)

    expect(callback.mock.calls[2]).toEqual([element, index, testArr])
  }
)
