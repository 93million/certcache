const test = require('../../lib/client/testCmd')
const { cahkeys, host } = require('./args')

module.exports = {
  cmd: 'test',
  desc: 'Test the connection to the Certcache server',
  builder: { cahkeys, host },
  handler: test
}
