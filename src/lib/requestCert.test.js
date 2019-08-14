/* global jest test expect beforeEach */

const requestCert = require('./requestCert')
const clientAuthenticatedHttps =
  require('../lib/clientAuthenticatedHttps/clientAuthenticatedHttps')
const { Readable, Writable } = require('stream')

const host = 'certcache.example.com'
const port = 12345
const domains = ['secure.example.com', 'secret.example.com']
const isTest = true
const mockResponse = 'test certcache response data'
let requestData
const mockErrorMessage = '__test error message__'

jest.mock('../lib/clientAuthenticatedHttps/clientAuthenticatedHttps')

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
        responseStream.push(mockResponse)
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
    await requestCert({ host, port }, domains, isTest)

    expect(JSON.parse(requestData))
      .toEqual({ action: 'getCert', domains, isTest })
  }
)

test(
  'should return the data returned by the certcache server in a promise',
  async () => {
    const response = await requestCert({ host, port }, domains, isTest)

    await expect(response).toBe(mockResponse)
  }
)

test(
  'should throw an error if an error is returned by the request library',
  async () => {
    setUpRequestMockImplementation(true)

    await expect(requestCert({ host, port }, domains, isTest))
      .rejects
      .toThrow()
  }
)
