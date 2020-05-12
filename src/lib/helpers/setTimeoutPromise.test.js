/* global jest test expect */

const setTimeoutPromise = require('./setTimeoutPromise')

const mockCallback = jest.fn()
const mockCallbackReturnValue = 4321
const mockTimeout = 1

mockCallback.mockReturnValue(mockCallbackReturnValue)
global.setTimeout = jest.fn()
global.setTimeout.mockImplementation((callback) => { callback() })

test(
  'should return a promise',
  () => {
    expect(setTimeoutPromise(mockCallback, mockTimeout))
      .toStrictEqual(expect.any(Promise))
  }
)

test(
  'should resolve with the value returned by the callback',
  async () => {
    await expect(setTimeoutPromise(mockCallback, mockTimeout))
      .resolves
      .toBe(mockCallbackReturnValue)
  }
)

test(
  'should call setTimeout with callback function and timeout',
  () => {
    setTimeoutPromise(mockCallback, mockTimeout)

    expect(global.setTimeout).toBeCalledWith(expect.any(Function), mockTimeout)
    expect(mockCallback).toBeCalled()
  }
)
