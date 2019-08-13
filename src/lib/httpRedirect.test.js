/* global jest test expect beforeEach */

const httpRedirect = require('./httpRedirect')
const http = require('http')

jest.mock('http')

const listen = jest.fn()
const close = jest.fn()
let requestHandler

listen.mockReturnValue({ close })

http.createServer.mockImplementation((handler) => {
  requestHandler = handler

  return { listen }
})

const res = { writeHead: jest.fn(), end: jest.fn() }
const redirectUrl = 'http://example.com'
const requestPath = '/.well-known/anything/'

beforeEach(() => {
  listen.mockClear()
  close.mockClear()
  http.createServer.mockClear()
  res.writeHead.mockClear()
  res.end.mockClear()
})

test(
  'should start an http server on port 80',
  () => {
    httpRedirect.start(redirectUrl)

    expect(http.createServer).toHaveBeenCalledTimes(1)
    expect(listen).toHaveBeenCalledTimes(1)
    expect(listen).toBeCalledWith(80)
  }
)

test(
  'should redirect requests to paths starting with \'/.well-known/\'',
  () => {
    httpRedirect.start(redirectUrl)
    requestHandler({ url: requestPath }, res)

    expect(res.writeHead).toHaveBeenCalledTimes(1)
    expect(res.writeHead).toBeCalledWith(302, {
      Location: `${redirectUrl}${requestPath}`
    })
    expect(res.end).toHaveBeenCalledTimes(1)
  }
)

test(
  'should not redirect requests to paths not starting with \'/.well-known/\'',
  () => {
    httpRedirect.start(redirectUrl)
    requestHandler({ url: '/test/path/' }, res)

    expect(res.writeHead).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalledTimes(1)
  }
)

test(
  'should to redirect URLs ending with and without forward slashes equally',
  () => {
    httpRedirect.start(redirectUrl)
    requestHandler({ url: requestPath }, res)

    httpRedirect.start(`${redirectUrl}/`)
    requestHandler({ url: requestPath }, res)

    expect(res.writeHead).toHaveBeenCalledTimes(2)
    expect(res.end).toHaveBeenCalledTimes(2)

    const expectedLocation = `${redirectUrl}${requestPath}`

    expect(res.writeHead.mock.calls[0][1]).toEqual({
      Location: expectedLocation
    })

    expect(res.writeHead.mock.calls[1][1]).toEqual({
      Location: `${redirectUrl}${requestPath}`
    })
  }
)

test(
  'should stop the http server when requested to',
  () => {
    httpRedirect.start(redirectUrl)
    httpRedirect.stop()

    expect(close).toHaveBeenCalledTimes(1)
  }
)
