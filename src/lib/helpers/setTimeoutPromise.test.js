/* global jest test expect */

const setTimeoutPromise = require('./setTimeoutPromise')

const mockCallback = jest.fn()
const mockCallbackReturnValue = 4321
const mockTimeoutMs = 1
const mockTimeoutId = 123

mockCallback.mockReturnValue(mockCallbackReturnValue)
global.setTimeout = jest.fn()
global.setTimeout.mockImplementation((callback) => {
  callback()
  return mockTimeoutId
})
global.clearTimeout = jest.fn()

test(
  'should return a promise',
  () => {
    expect(setTimeoutPromise(mockCallback, mockTimeoutMs))
      .toStrictEqual(expect.any(Promise))
  }
)

test(
  'should resolve with the value returned by the callback',
  async () => {
    await expect(setTimeoutPromise(mockCallback, mockTimeoutMs))
      .resolves
      .toBe(mockCallbackReturnValue)
  }
)

test(
  'should call setTimeout with callback function and timeout',
  () => {
    setTimeoutPromise(mockCallback, mockTimeoutMs)

    expect(global.setTimeout)
      .toBeCalledWith(expect.any(Function), mockTimeoutMs)
    expect(mockCallback).toBeCalled()
  }
)

test(
  'should be able to clear timeout from promise',
  () => {
    const promise = setTimeoutPromise(mockCallback, mockTimeoutMs)

    promise.clearTimeout()

    expect(global.clearTimeout).toBeCalledWith(mockTimeoutId)
  }
)
