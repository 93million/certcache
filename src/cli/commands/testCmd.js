const test = require('../../lib/client/testCmd')
const { cahkeys, upstream } = require('./args')

module.exports = {
  cmd: 'test',
  desc: 'Test the connection to the Certcache server',
  builder: { cahkeys, upstream },
  handler: test
}
