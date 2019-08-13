/* global jest describe test expect beforeEach */

const clientAuthenticatedHttps = require('./clientAuthenticatedHttps')
const https = require('https')
const loadKey = require('./lib/loadKey')

jest.mock('https')
jest.mock('./lib/loadKey')
jest.mock('./lib/getCAHKeyPath')

const mockLoadKeyObj = {
  ca: '/path/test/ca-cert.pem',
  cert: '/path/test/cert.pem',
  key: '/path/test/key.pem'
}

loadKey.mockReturnValue(Promise.resolve(mockLoadKeyObj))

describe(
  'clientAuthenticatedHttps.createServer()',
  () => {
    const opts = { port: 1234 }
    const handler = () => {}

    https.createServer.mockImplementation = () => {}

    beforeEach(() => {
      https.createServer.mockClear()
    })

    test(
      'should wrap https createServer with handler callback as only arg',
      async () => {
        await clientAuthenticatedHttps.createServer(handler)

        expect(https.createServer).toBeCalledWith(
          {
            ...mockLoadKeyObj,
            requestCert: true,
            rejectUnauthorized: true
          },
          handler
        )
      }
    )

    test(
      'should wrap https createServer with request options object as only arg',
      async () => {
        await clientAuthenticatedHttps.createServer(opts)

        expect(https.createServer).toBeCalledWith(
          {
            ...opts,
            ...mockLoadKeyObj,
            requestCert: true,
            rejectUnauthorized: true
          },
          undefined
        )
      }
    )

    test(
      'should wrap https createServer with both request handler callback and request options objects',
      async () => {
        await clientAuthenticatedHttps.createServer(opts, handler)

        expect(https.createServer).toBeCalledWith(
          {
            ...opts,
            ...mockLoadKeyObj,
            requestCert: true,
            rejectUnauthorized: true
          },
          handler
        )
      }
    )
  }
)

describe(
  'clientAuthenticatedHttps.request()',
  () => {
    const url = 'https://www.example.com/test?url=true'
    const opts = { method: 'POST' }
    const callback = () => {}

    https.request.mockImplementation = () => {}

    beforeEach(() => {
      https.request.mockClear()
    })

    test(
      'should wrap https.request with url as only arg',
      async () => {
        await clientAuthenticatedHttps.request(url)

        expect(https.request).toBeCalledWith(url, mockLoadKeyObj, undefined)
      }
    )
    test(
      'should wrap https.request with options as only arg',
      async () => {
        await clientAuthenticatedHttps.request(opts)

        expect(https.request)
          .toBeCalledWith({ ...mockLoadKeyObj, ...opts }, undefined)
      }
    )
    test(
      'should wrap https.request with url and options args',
      async () => {
        await clientAuthenticatedHttps.request(url, opts)

        expect(https.request)
          .toBeCalledWith(url, { ...mockLoadKeyObj, ...opts }, undefined)
      }
    )
    test(
      'should wrap https.request with url and callback args',
      async () => {
        await clientAuthenticatedHttps.request(url, callback)

        expect(https.request).toBeCalledWith(url, mockLoadKeyObj, callback)
      }
    )
    test(
      'should wrap https.request with options and callback args',
      async () => {
        await clientAuthenticatedHttps.request(opts, callback)

        expect(https.request)
          .toBeCalledWith({ ...mockLoadKeyObj, ...opts }, callback)
      }
    )
    test(
      'should wrap https.request with url, options and callback args',
      async () => {
        await clientAuthenticatedHttps.request(url, opts, callback)

        expect(https.request)
          .toBeCalledWith(url, { ...mockLoadKeyObj, ...opts }, callback)
      }
    )
    test(
      'should provide .get() as a wrapper for .request()',
      async () => {
        await clientAuthenticatedHttps.get(url, opts, callback)

        expect(https.request).toBeCalledWith(
          url,
          { ...mockLoadKeyObj, ...opts, method: 'GET' },
          callback
        )
      }
    )
  }
)
