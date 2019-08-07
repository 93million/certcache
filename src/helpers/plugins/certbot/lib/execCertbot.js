const child_process = require('child_process')
const util = require('util')
const concurrencyLimiter = require('../../../concurrencyLimiter')

const execFile = util.promisify(child_process.execFile)

module.exports = concurrencyLimiter(execFile, 1)
