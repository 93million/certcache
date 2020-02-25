const path = require('path')
const { promisify } = require('util')
const fse = require('fs-extra')
const childProcess = require('child_process')
const {
  cliCmd,
  testClientCahkeysDir,
  testDir,
  testServerCahkeysDir,
  testServerDir,
  testSkelDir
} = require('../filepaths')

const execFile = promisify(childProcess.execFile)

module.exports = async () => {
  // delete testing dir
  await fse.emptyDir(testDir)
  await fse.copy(testSkelDir, testDir)
  // // create authentication keys
  await execFile(
    cliCmd,
    ['create-keys', '-n', 'localhost', '--cahkeys', testServerCahkeysDir]
  )

  // copy client key to certcache client
  await fse.copy(
    path.resolve(testServerCahkeysDir, 'client.cahkey'),
    path.resolve(testClientCahkeysDir, 'client.cahkey')
  )

  // create test certs
  await execFile(path.resolve(__dirname, '..', 'bin', 'createca.sh'))
  await execFile(
    path.resolve(__dirname, '..', 'bin', 'createca.sh'),
    ['-n', 'test.example.com']
  )

  // start certcache server
  const serveProcess = childProcess.execFile(
    cliCmd,
    ['serve', '--cahkeys', testServerCahkeysDir],
    { cwd: testServerDir }
  )

  return async () => {
    serveProcess.kill()
    await fse.emptyDir(testDir)
  }
}
