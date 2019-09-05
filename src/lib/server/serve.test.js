/* global jest test expect beforeEach */

const serve = require('./serve')
const clientAuthenticatedHttps = require('client-authenticated-https')
const actions = require('./actions')
const FeedbackError = require('../FeedbackError')
const { Readable, Writable } = require('stream')

jest.mock('client-authenticated-https')
jest.mock('./actions')

let action
const payload = { test: 'payload', other: 58008 }
let response
const mockActionReturnValue = { foo: 'bar', test: 123 }
const listen = jest.fn()
const writeHead = jest.fn()

console.error = jest.fn()

clientAuthenticatedHttps.createServer.mockImplementation((callback) => {
  const requestBody = JSON.stringify({ action, ...payload })
  const _response = []
  const req = new Readable({ read: () => {} })
  const res = new Writable({ write: (chunk, encoding, callback) => {
    _response.push(chunk)
    callback()
  } })

  res.writeHead = writeHead

  req.push(requestBody)
  req.push(null)

  callback(req, res)

  return new Promise((resolve) => {
    res.on('finish', () => {
      response = _response.join('')
      resolve({ listen })
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

beforeEach(() => {
  actions.testAction.mockClear()
  console.error.mockClear()
  writeHead.mockClear()
  action = 'testAction'
})

test(
  'should call action submitted in request',
  async () => {
    await serve()

    expect(actions.testAction).toBeCalledTimes(1)
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

    expect(writeHead).toBeCalledWith(200, { 'Content-Type': 'application/json' })
  }
)

test(
  'should send a 500 HTTP status code when action throws an error',
  async () => {
    action = 'throwingAction'

    await serve()

    expect(writeHead).toBeCalledWith(500, { 'Content-Type': 'application/json' })
  }
)
