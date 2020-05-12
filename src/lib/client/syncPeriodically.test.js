/* global jest test expect  */

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

setTimeoutPromise.mockImplementationOnce(() => Promise.resolve())

syncCerts.mockReturnValue(Promise.resolve())

const httpRedirectUrl = 'https://certcache.example.com'

getConfig.mockReturnValueOnce(Promise.resolve({
  httpRedirectUrl
}))

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
  () => {
    setTimeoutPromise.mockImplementationOnce((callback) => { callback() })

    syncPeriodically(true)

    return new Promise((resolve, reject) => {
      process.nextTick(resolve)
    })
      .then(() => {
        expect(setTimeoutPromise)
          .toBeCalledWith(expect.any(Function), expect.any(Number))
      })
  }
)
