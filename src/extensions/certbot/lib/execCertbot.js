const childProcess = require('child_process')
const util = require('util')
const concurrencyLimiter = require('../../../lib/helpers/concurrencyLimiter')

const execFile = util.promisify(childProcess.execFile)

module.exports = concurrencyLimiter(execFile, 1)
