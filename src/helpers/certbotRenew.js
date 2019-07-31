const child_process = require('child_process')
const config = require('../config')
const util = require('util')
const getCertbotRenewArgs = require('./getCertbotRenewArgs')

const execFile = util.promisify(child_process.execFile)

module.exports = async () => {
  return await execFile(config.certbotExec, getCertbotRenewArgs(config))
}
