const child_process = require('child_process')
const config = require('../config')
const util = require('util')

const execFile = util.promisify(child_process.execFile)

module.exports = async () => {
  const {certbotConfigDir, certbotExec, certbotHttpAuthPort} = config
  const certbotWorkDir = __dirname + '/../../certbot/work/'
  const certbotLogsDir = __dirname + '/../../certbot/logs/'
  const certbotArgs = [
    'renew',
    `--config-dir`,
    certbotConfigDir,
    `--logs-dir`,
    certbotLogsDir,
    `--work-dir`,
    certbotWorkDir,
    '-q'
  ]

  if (certbotHttpAuthPort !== undefined) {
    certbotArgs.push('--http-01-port')
    certbotArgs.push(certbotHttpAuthPort)
  }

  return await execFile(certbotExec, certbotArgs)
}
