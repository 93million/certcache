const concurrencyLimiter = require('./concurrencyLimiter')

test(
  'should limit the number of concurrent callbacks',
  async () => {
    let inProgress = 0
    const asyncFn = () => new Promise((resolve) => {
      inProgress++
      setTimeout(resolve, 0)
    })
    const limitedFn = concurrencyLimiter(asyncFn, 2)
    const all = Promise.all([
      limitedFn(),
      limitedFn(),
      limitedFn(),
      limitedFn()
    ])

    expect(inProgress).toBe(2)
  }
)

test(
  'should resolve with value of promise resolved by each invokation',
  async () => {
    const asyncFn = (value) => new Promise((resolve) => {
      setTimeout(() => { resolve(value * 2) }, 0)
    })
    const limitedFn = concurrencyLimiter(asyncFn, 2)

    await expect(limitedFn(2)).resolves.toBe(4)
    await expect(limitedFn(3)).resolves.toBe(6)
    await expect(limitedFn(4)).resolves.toBe(8)
    await expect(limitedFn(5)).resolves.toBe(10)
  }
)

test(
  'should continue to resolve following rejected promises',
  async () => {
    let count = 0
    const asyncFn = (shouldThrow = false) => new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldThrow) {
          reject(new Error('doh!'))
        } else {
          count++
          resolve()
        }
      }, 0)
    })
    const _catch = jest.fn()
    const limitedFn = concurrencyLimiter(asyncFn, 2)

    await Promise.all([
      limitedFn(),
      limitedFn(true).catch(_catch),
      limitedFn(),
      limitedFn()
    ])

    expect(count).toBe(3)
    expect(_catch).toBeCalledTimes(1)
  }
)
