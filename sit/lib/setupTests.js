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
  testSkelDir,
  testStandaloneDir
} = require('../filepaths')
const startNgrok = require('./startNgrok')

const execFile = promisify((cmd, a2, a3, a4) => {
  const args = (Array.isArray(a2)) ? a2 : []
  const callback = [a2, a3, a4].find((arg) => (typeof arg === 'function'))

  childProcess.execFile(cmd, args, (err, stdin, stderr) => {
    if (callback !== undefined) {
      callback((err || stderr), stdin)
    }
  })
})

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
  await execFile(
    path.resolve(__dirname, '..', 'bin', 'createca.sh'),
    ['-d', path.resolve(testServerDir, 'cache', 'thirdparty')]
  )
  await execFile(
    path.resolve(__dirname, '..', 'bin', 'createcert.sh'),
    [
      '-n',
      'test.example.com',
      '-d',
      path.resolve(testServerDir, 'cache', 'thirdparty')
    ]
  )
  await execFile(
    path.resolve(__dirname, '..', 'bin', 'createcert.sh'),
    [
      '-n',
      'foo.example.com',
      '-d',
      path.resolve(testServerDir, 'cache', 'thirdparty')
    ]
  )
  await execFile(
    path.resolve(__dirname, '..', 'bin', 'createca.sh'),
    ['-d', path.resolve(testStandaloneDir, 'cache', 'thirdparty')]
  )
  await execFile(
    path.resolve(__dirname, '..', 'bin', 'createcert.sh'),
    [
      '-n',
      'standalone.example.com',
      '-d',
      path.resolve(testStandaloneDir, 'cache', 'thirdparty')
    ]
  )

  // start ngrok
  const { info: ngrok, process: ngrokProcess } = await startNgrok([
    'http',
    '80'
  ])

  // start certcache server
  const serveProcess = childProcess.execFile(
    cliCmd,
    ['serve', '--cahkeys', testServerCahkeysDir],
    { cwd: testServerDir }
  )

  serveProcess.stderr.on('data', (data) => {
    console.error('CertCache server error:', data.toString())
  })

  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    cleanup: async () => {
      serveProcess.kill()
      ngrokProcess.kill()
      await fse.emptyDir(testDir)
    },
    ngrok
  }
}
