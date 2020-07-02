const path = require('path')

const cliCmd = path.resolve(__dirname, '..', 'src', 'cli', 'cli.js')
const testSkelDir = path.resolve(__dirname, 'skel')
const testDir = path.resolve(__dirname, 'test')
const testServerDir = path.resolve(testDir, 'server')
const testClientDir = path.resolve(testDir, 'client')
const testServerCahkeysDir = path.resolve(testServerDir, 'cahkeys')
const testClientCahkeysDir = path.resolve(testClientDir, 'cahkeys')
const testStandaloneDir = path.resolve(testDir, 'standalone')

module.exports = {
  cliCmd,
  testClientCahkeysDir,
  testClientDir,
  testDir,
  testServerCahkeysDir,
  testServerDir,
  testSkelDir,
  testStandaloneDir
}
