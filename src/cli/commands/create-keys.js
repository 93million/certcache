const childProcess = require('child_process')
const path = require('path')
const util = require('util')
const { catkeys } = require('./args')
const getConfig = require('../../lib/getConfig')

const execFile = util.promisify(childProcess.execFile)

module.exports = {
  cmd: 'create-keys',
  desc:
    'Create access keys to allow certcache clients to access certcache server',
  builder: { catkeys },
  handler: async (argv) => {
    const execScript = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'node_modules',
      '.bin',
      'catkeys'
    )
    const { catKeysDir } = (await getConfig())

    execFile(
      execScript,
      ['create-key', '--server', '--keydir', catKeysDir]
    )
      .then(() => {
        execFile(
          execScript,
          ['create-key', '--keydir', catKeysDir, '--name', 'client']
        )
      })
      .catch((err) => {
        console.error(err)
      })
  }
}
