const childProcess = require('child_process')
const path = require('path')
const util = require('util')
const { cahkeys } = require('./args')
const getConfig = require('../../lib/getConfig')

const execFile = util.promisify(childProcess.execFile)

module.exports = {
  cmd: 'create-keys',
  desc:
    'Create access keys to allow certcache clients to access certcache server',
  builder: { cahkeys },
  handler: async (argv) => {
    const execScript = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'node_modules',
      '.bin',
      'client-authenticated-https'
    )
    const { cahKeysDir } = (await getConfig())

    execFile(
      execScript,
      ['create-key', '--server', '--keydir', cahKeysDir]
    )
      .then(() => {
        execFile(
          execScript,
          ['create-key', '--keydir', cahKeysDir, '--name', 'client']
        )
      })
      .catch((err) => {
        console.error(err)
      })
  }
}
