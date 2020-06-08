/* global jest afterEach test expect  */

const syncPeriodically = require('./syncPeriodically')
const getConfig = require('../getConfig')
const httpRedirect = require('../httpRedirect')
const syncCerts = require('../../lib/client/syncCerts')
const setTimeoutPromise = require('../helpers/setTimeoutPromise')

process.exit = jest.fn()
console.error = jest.fn()

jest.mock('../getConfig')
jest.mock('../../lib/client/syncCerts')
jest.mock('../httpRedirect')
jest.mock('../helpers/setTimeoutPromise')

const mockTimeout = Promise.resolve()
mockTimeout.clearTimeout = jest.fn()

setTimeoutPromise.mockImplementation((callback) => mockTimeout)

syncCerts.mockReturnValue(Promise.resolve())

const httpRedirectUrl = 'https://certcache.example.com'

getConfig.mockReturnValueOnce(Promise.resolve({
  httpRedirectUrl
}))

afterEach(() => {
  process.emit('SIGTERM')
})

test(
  'should start an http proxy when requested',
  async () => {
    await syncPeriodically()

    expect(httpRedirect.start).toBeCalledWith(httpRedirectUrl)
  }
)

test(
  'should log errors when syncing once',
  async () => {
    const err = new Error('barf!')

    syncCerts.mockReturnValueOnce(Promise.reject(err))

    await syncPeriodically()

    expect(console.error).toBeCalledWith(err)
  }
)

test(
  'should log errors when syncing forever',
  async () => {
    const err = new Error('barf!')

    syncCerts.mockReturnValueOnce(Promise.reject(err))

    await syncPeriodically(true)

    expect(console.error).toBeCalledWith(new Error('barf!'))
  }
)

test(
  'should exit with error code when not running forever',
  async () => {
    const err = new Error('barf!')

    syncCerts.mockReturnValueOnce(Promise.reject(err))

    await syncPeriodically()

    expect(process.exit).toBeCalledWith(expect.any(Number))
  }
)

test(
  'should run forever when requested',
  async () => {
    setTimeoutPromise.mockImplementationOnce((callback) => {
      callback()
      return mockTimeout
    })

    syncPeriodically(true)

    await new Promise((resolve, reject) => { setImmediate(resolve) })
    expect(setTimeoutPromise)
      .toBeCalledWith(expect.any(Function), expect.any(Number))
  }
)

test(
  'should clear sync timeout to shut down nicely on SIGTERM',
  async () => {
    syncPeriodically(true)
    syncPeriodically()
    await new Promise((resolve, reject) => { setImmediate(resolve) })
    process.emit('SIGTERM')
    expect(mockTimeout.clearTimeout).toBeCalledTimes(1)
  }
)
