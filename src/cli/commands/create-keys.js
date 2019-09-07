const childProcess = require('child_process')
const path = require('path')
const util = require('util')

const execFile = util.promisify(childProcess.execFile)

module.exports = {
  cmd: 'create-keys',
  desc: 'Create access keys to allow certcache clients to access certcache server',
  builder: {
    name: {
      alias: 'n',
      description: 'Certcache server hostname',
      required: true
    },
    keydir: {
      default: process.env.CAH_KEYS_DIR ||
        path.resolve(__dirname, '..', '..', 'cahkeys')
    }
  },
  handler: (argv) => {
    const execScript = 'client-authenticated-https'

    execFile(
      execScript,
      ['create-key', '--server', '--keydir', argv.keydir, '--name', argv.name]
    )
      .then(() => {
        execFile(
          execScript,
          ['create-key', '--keydir', argv.keydir, '--name', 'client']
        )
      })
      .catch((err) => {
        console.error(err)
      })
  }
}
