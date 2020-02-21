const childProcess = require('child_process')
const path = require('path')
const util = require('util')
const { cahkeys } = require('./args')

const execFile = util.promisify(childProcess.execFile)

module.exports = {
  cmd: 'create-keys',
  desc: 'Create access keys to allow certcache clients to access certcache server',
  builder: {
    cahkeys,
    name: {
      alias: 'n',
      description: 'Certcache server hostname',
      required: true
    }
  },
  handler: (argv) => {
    const execScript = path.resolve(__dirname, '..', '..', '..', 'node_modules', '.bin', 'client-authenticated-https')

    execFile(
      execScript,
      ['create-key', '--server', '--keydir', argv.cahkeys, '--name', argv.name]
    )
      .then(() => {
        execFile(
          execScript,
          ['create-key', '--keydir', argv.cahkeys, '--name', 'client']
        )
      })
      .catch((err) => {
        console.error(err)
      })
  }
}
