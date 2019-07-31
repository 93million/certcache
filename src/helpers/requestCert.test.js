const requestCert = require('./requestCert')
const clientAuthenticatedHttps =
  require('../clientAuthenticatedHttps/clientAuthenticatedHttps')

jest.mock('../clientAuthenticatedHttps/clientAuthenticatedHttps')

const pushEvent = (eventObj, event, callback) => {
  if (eventObj[event] === undefined) {
    eventObj[event] = []
  }

  eventObj[event].push(callback)
}
const dispatchEvent = (eventObj, event, argsArr = []) => {
  eventObj[event].forEach((callback) => callback(...argsArr))
}
let requestEvents = {}
let requestData
const requestObj = {
  on: (event, callback) => {
    pushEvent(requestEvents, event, callback)
  },
  write: (postData) => {
    requestData = postData
  },
  end: () => {
    responseCallback({
      on: (event, callback) => {
        pushEvent(responseEvents, event, callback)
      }
    })
  }
}
let responseEvents = {}
const responseData = 'test certcache response data'
const responseObj = {
  on: (event, callback) => {
    pushEvent(responseEvents, event, callback)
  }
}
let requestOptions
let responseCallback

clientAuthenticatedHttps.request.mockImplementation((options, callback) => {
  requestOptions = options
  responseCallback = callback

  return requestObj
})

const host = 'certcache.example.com'
const port = 12345
const domains = ['secure.example.com', 'secret.example.com']
const isTest = true

beforeEach(() => {
  requestEvents = {}
  responseEvents = {}
})

test(
  'should send a request to the for the certificate to the certcache server',
  async () => {
    const request = requestCert({host, port}, domains, isTest)

    responseCallback(responseObj)

    dispatchEvent(responseEvents, 'end')

    await request

    expect(requestData)
      .toBe(JSON.stringify({action: 'getCert', domains, isTest}))
  }
)

test(
  'should return the data returned by the certcache server in a promise',
  async () => {
    const request = requestCert({host, port}, domains, isTest)

    responseCallback(responseObj)

    dispatchEvent(responseEvents, 'data', [responseData])
    dispatchEvent(responseEvents, 'end')

    await request

    await expect(request).resolves.toBe(responseData)
  }
)

test(
  'should throw an error if an error is returned by the request library',
  async () => {
    const request = requestCert({host, port}, domains, isTest)

    responseCallback(responseObj)

    dispatchEvent(responseEvents, 'end')

    await request

    expect(() => {
      dispatchEvent(requestEvents, 'error', [new Error('test error')])
    })
      .toThrow()
  }
)
