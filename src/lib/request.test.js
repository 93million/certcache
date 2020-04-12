/* global jest test expect beforeEach */

const request = require('./request')
const clientAuthenticatedHttps = require('client-authenticated-https')
const { Readable, Writable } = require('stream')

const host = 'certcache.example.com'
const port = 12345
const action = 'doSomething'
const domains = ['secure.example.com', 'secret.example.com']
const meta = { isTest: true }
const mockResponse = { data: 'test certcache response data' }
let requestData
const mockErrorMessage = '__test error message__'

jest.mock('client-authenticated-https')

const setUpRequestMockImplementation = (shouldThrow) => {
  clientAuthenticatedHttps.request.mockReset()
  clientAuthenticatedHttps.request.mockImplementation((options, callback) => {
    const requestDataArr = []
    const responseStream = new Readable({ read: () => {} })
    const requestStream = new Writable({
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
        responseStream.push(JSON.stringify(mockResponse))
        responseStream.push(null)
      }
    })

    callback(responseStream)

    return Promise.resolve(requestStream)
  })
}

beforeEach(() => {
  setUpRequestMockImplementation(false)
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

    await expect(response).toEqual(mockResponse)
  }
)

test(
  'should throw an error if an error is returned by the request library',
  async () => {
    setUpRequestMockImplementation(true)

    await expect(request({ host, port }, { domains, meta }))
      .rejects
      .toThrow()
  }
)
