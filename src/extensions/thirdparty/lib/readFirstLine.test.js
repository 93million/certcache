/* global jest test expect beforeEach */

const readFirstLine = require('./readFirstLine')
const fs = require('fs')
const EventEmitter = require('events')

jest.mock('fs')

const mockDataChunks = ['chunk 1', 'chun\nk 2', 'chunk 3', 'ch\nunk 4']
const mockFirstLine = 'chunk 1chun'

let readable

class MockReadStream extends EventEmitter {
  constructor (mockData, shouldThrow = false) {
    super()
    this.closed = false
    this.mockData = mockData
    this.shouldThrow = shouldThrow
  }

  close () {
    this.closed = true
    this.emit('close')
  }

  startData () {
    let chunkNum = 0
    const sendNextData = () => {
      setImmediate(() => {
        if (this.shouldThrow) {
          this.emit('error', new Error('Unable to do my job'))
        }
        if (this.closed === false) {
          this.emit('data', mockDataChunks[chunkNum++])

          if (chunkNum === this.mockData.length) {
            this.emit('close')
          }

          sendNextData()
        }
      })
    }

    sendNextData()
  }
}

beforeEach(() => {
  readable = new MockReadStream(mockDataChunks)

  fs.createReadStream.mockImplementation(() => {
    readable.startData()

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

    readable = new MockReadStream(mockDataChunks, true)

    await expect(readFirstLine('/test/path/to.file'))
      .rejects
      .toThrow(err)
  }
)
