/* global jest test expect beforeEach afterEach */

const serve = require('./serve')
const { https } = require('catkeys')
const actions = require('./actions')
const FeedbackError = require('../FeedbackError')
const { Readable, Writable } = require('stream')
const getConfig = require('../getConfig')

jest.mock('catkeys')
jest.mock('./actions')
jest.mock('../getArgv')

let action
const payload = { test: 'payload', other: 58008 }
let response
const mockActionReturnValue = { foo: 'bar', test: 123 }
let mockConfig
const listen = jest.fn()
const writeHead = jest.fn()
const mockClientName = 'mockClient'
const close = jest.fn()
const setTimeout = jest.fn()
let mockSocket

listen.mockReturnValue({ close })

console.error = jest.fn()

https
  .createServer
  .mockImplementation((options, callback) => {
    const requestBody = JSON.stringify({ action, ...payload })
    const _response = []
    const req = new Readable({ read: () => {} })
    const res = new Writable({ write: (chunk, encoding, callback) => {
      _response.push(chunk)
      callback()
    } })

    req.connection = {
      getPeerCertificate: () => ({ subject: { CN: mockClientName } })
    }

    res.writeHead = writeHead
    res.socket = mockSocket

    req.push(requestBody)
    req.push(null)

    callback(req, res)

    return new Promise((resolve) => {
      res.on('finish', () => {
        response = _response.join('')
        resolve({ listen, setTimeout })
      })
    })
  })

actions.testAction = jest.fn()
actions.testAction.mockImplementation(() => {
  return Promise.resolve(mockActionReturnValue)
})
actions.throwingAction = jest.fn()
actions.throwingAction.mockImplementation(() => {
  throw new Error('barf!')
})

const feedbackErrorMessage = 'Test feedback error message'

actions.throwingFeedbackErrorAction = jest.fn()
actions.throwingFeedbackErrorAction.mockImplementation(() => {
  throw new FeedbackError(feedbackErrorMessage)
})

beforeEach(async () => {
  action = 'testAction'
  mockConfig = await getConfig()
  mockSocket = { destroyed: false }
})

afterEach(() => {
  process.emit('SIGTERM')
})

test(
  'should call action submitted in request',
  async () => {
    await serve()

    expect(actions.testAction).toHaveBeenCalledTimes(1)
  }
)

test(
  'should return data returned by action',
  async () => {
    await serve()

    expect(JSON.parse(response).data).toEqual(mockActionReturnValue)
  }
)

test(
  'should return error when action doesn\'t exist',
  async () => {
    action = 'nonExistantAction'

    await serve()

    expect(JSON.parse(response).success).toBe(false)
  }
)

test(
  'should return error when error is thrown from action',
  async () => {
    action = 'throwingAction'

    await serve()

    expect(JSON.parse(response).success).toBe(false)
  }
)

test(
  'should include error message when throwing a \'FeedbackError\'',
  async () => {
    action = 'throwingFeedbackErrorAction'

    await serve()

    expect(JSON.parse(response).error).toBe(feedbackErrorMessage)
  }
)

test(
  'should send a 200 HTTP status code when action completes successfully',
  async () => {
    await serve()

    expect(writeHead)
      .toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' })
  }
)

test(
  'should send a 500 HTTP status code when action throws an error',
  async () => {
    action = 'throwingAction'

    await serve()

    expect(writeHead)
      .toHaveBeenCalledWith(500, { 'Content-Type': 'application/json' })
  }
)

test(
  'should start server on port specified in opts',
  async () => {
    action = 'throwingAction'

    await serve()

    expect(listen).toHaveBeenCalledWith(mockConfig.server.port)
  }
)

test(
  'should stop serving on SIGTERM to exit cleanly',
  async () => {
    serve()

    await new Promise((resolve) => { setImmediate(resolve) })

    process.emit('SIGTERM')

    expect(close).toHaveBeenCalledTimes(1)
  }
)

test(
  'should not send response when conncetion has been closed',
  async () => {
    mockSocket = { destroyed: true }

    await serve()

    expect(writeHead).not.toHaveBeenCalledWith()
  }
)
test(
  'should pass client name to actions',
  async () => {
    await serve()

    expect(actions.testAction)
      .toHaveBeenCalledWith(payload, { clientName: mockClientName })
  }
)
