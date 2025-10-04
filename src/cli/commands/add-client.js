const childProcess = require('child_process')
const path = require('path')
const util = require('util')
const { catkeys } = require('./args')
const getConfig = require('../../lib/getConfig')

const execFile = util.promisify(childProcess.execFile)

module.exports = {
  cmd: 'add-client [name]',
  desc:
    'Create access keys to allow certcache clients to access certcache server',
  builder: (yargs) => {
    yargs.positional('name', {
      describe: 'Name of the client key',
      required: true
    })
    yargs.option('catkeys', catkeys)
  },
  handler: async (argv) => {
    const { catKeysDir } = (await getConfig())

    const execScript = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'node_modules',
      '.bin',
      'catkeys'
    )

    execFile(
      execScript,
      ['create-key', '--keydir', catKeysDir, '--name', argv.name]
    )
      .catch((err) => {
        console.error(err)
      })
  }
}
