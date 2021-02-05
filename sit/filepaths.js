const path = require('path')

const cliCmd = path.resolve(__dirname, '..', 'src', 'cli', 'cli.js')
const testSkelDir = path.resolve(__dirname, 'skel')
const testDir = path.resolve(__dirname, 'test')
const testServerDir = path.resolve(testDir, 'server')
const testClientDir = path.resolve(testDir, 'client')
const testServerCatkeysDir = path.resolve(testServerDir, 'catkeys')
const testClientCatkeysDir = path.resolve(testClientDir, 'catkeys')
const testStandaloneDir = path.resolve(testDir, 'standalone')

module.exports = {
  cliCmd,
  testClientCatkeysDir,
  testClientDir,
  testDir,
  testServerCatkeysDir,
  testServerDir,
  testSkelDir,
  testStandaloneDir
}
