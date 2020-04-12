/* global jest test expect beforeEach */

const readFirstLine = require('./readFirstLine')
const fs = require('fs')
const { Readable } = require('stream')

jest.mock('fs')

const mockFirstLine = 'line 1'
const mockSecondLine = 'line 2'
const mockFileContents = [mockFirstLine, mockSecondLine].join('\n')

let readable

beforeEach(() => {
  readable = new Readable({ read: () => {} })
  readable.push(mockFileContents)
  readable.close = () => { readable.emit('close') }

  fs.createReadStream.mockImplementation(() => {
    return readable
  })
})

test(
  'should return the first line of a file',
  async () => {
    await expect(readFirstLine('/test/path/to.file'))
      .resolves
      .toBe(mockFirstLine)
  }
)

test(
  'should throw an error if an error occurs on read',
  async () => {
    const err = new Error('Unable to do my job')

    readable = new Readable({
      read: () => {
        readable.emit('error', err)
      }
    })

    await expect(readFirstLine('/test/path/to.file'))
      .rejects
      .toThrow(err)
  }
)
