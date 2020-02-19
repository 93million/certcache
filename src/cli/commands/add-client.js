const childProcess = require('child_process')
const path = require('path')
const util = require('util')

const execFile = util.promisify(childProcess.execFile)

module.exports = {
  cmd: 'add-client [name]',
  desc: 'Create access keys to allow certcache clients to access certcache server',
  builder: (yargs) => {
    yargs.positional('name', {
      describe: 'Name of the client key',
      required: true
    })
    yargs.option('keydir', {
      default: process.env.CAH_KEYS_DIR ||
        path.resolve(process.cwd(), 'cahkeys')
    })
  },
  handler: (argv) => {
    const execScript = path.resolve(__dirname, '..', '..', '..', 'node_modules', '.bin', 'client-authenticated-https')

    execFile(
      execScript,
      ['create-key', '--keydir', argv.keydir, '--name', argv.name]
    )
      .catch((err) => {
        console.error(err)
      })
  }
}
