/* global jest test expect beforeEach */

const request = require('./request')
const clientAuthenticatedHttps = require('client-authenticated-https')
const { Readable, Writable } = require('stream')

const host = 'certcache.example.com'
const port = 12345
const action = 'doSomething'
const domains = ['secure.example.com', 'secret.example.com']
const meta = { isTest: true }
const mockResponse = { data: 'test certcache response data', success: true }
let requestData
const mockErrorMessage = '__test error message__'
let requestStream

jest.mock('client-authenticated-https')

const setUpRequestMockImplementation = ({
  shouldThrow = false,
  response = mockResponse
} = {}) => {
  clientAuthenticatedHttps.request.mockReset()
  clientAuthenticatedHttps.request.mockImplementation((options, callback) => {
    const requestDataArr = []
    const responseStream = new Readable({ read: () => {} })
    requestStream = new Writable({
      write: (chunk, encoding, callback) => {
        requestDataArr.push(chunk)
        callback()
      }
    })

    requestStream.on('finish', () => {
      if (shouldThrow) {
        requestStream.emit('error', new Error(mockErrorMessage))
      } else {
        requestData = requestDataArr.join('')
        responseStream.push(JSON.stringify(response))
        responseStream.push(null)
      }
    })
    setImmediate(() => { callback(responseStream) })

    return Promise.resolve(requestStream)
  })
}

beforeEach(() => {
  setUpRequestMockImplementation()
})

test(
  'should send a request for the certificate to the certcache server',
  async () => {
    await request({ host, port }, action, { domains, meta })

    expect(JSON.parse(requestData))
      .toEqual({ action, domains, meta })
  }
)

test(
  'should return the data returned by the certcache server in a promise',
  async () => {
    const response = await request({ host, port }, action, { domains, meta })

    expect(response).toEqual(mockResponse.data)
  }
)

test(
  'should throw an error if an error is returned by the request library',
  async () => {
    setUpRequestMockImplementation({ shouldThrow: true })

    await expect(request({ host, port }, { domains, meta }))
      .rejects
      .toThrow()
  }
)

test(
  'should be able to be destroyed before request made',
  () => {
    expect.assertions(1)
    const req = request({ host, port }, { domains, meta })

    req.destroy()

    req.finally(() => {
      throw new Error([
        'request promise should not be resolved or rejected after being',
        'destroyed'
      ].join(' '))
    })

    return new Promise((resolve) => {
      setImmediate(() => {
        expect(requestStream.destroyed).toBe(true)
        resolve()
      })
    })
  }
)

test(
  'should be able to be destroyed after request made',
  async () => {
    const req = request({ host, port }, { domains, meta })

    await new Promise((resolve) => {
      process.nextTick(() => {
        req.destroy()
        resolve()
      })
    })

    expect(requestStream.destroyed).toBe(true)
  }
)

test(
  'should throw errors before being destroyed',
  async () => {
    const req = request({ host, port }, { domains, meta })

    process.nextTick(() => {
      const err = new Error('BAAAAH!')
      err.code = 'ECONNRESET'
      requestStream.emit('error', err)
    })

    await expect(req).rejects.toThrow('BAAAAH!')
  }
)

test(
  'should throw an error when response was not successful',
  async () => {
    const error = 'nope!'
    setUpRequestMockImplementation({ response: { success: false, error } })

    await expect(request({ host, port }, { domains, meta }))
      .rejects
      .toThrow(error)
  }
)
