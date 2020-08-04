const childProcess = require('child_process')
const util = require('util')
const path = require('path')
const getConfig = require('./getConfig')

const exec = util.promisify(childProcess.exec)

module.exports = async (command, extraEnv) => {
  const { binDir } = await getConfig()
  const env = {
    ...process.env,
    ...extraEnv,
    PATH: `${process.env.PATH}:${path.resolve(binDir)}`
  }

  await exec(command, { env })
}
