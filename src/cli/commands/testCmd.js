const test = require('../../lib/client/testCmd')

module.exports = {
  cmd: 'test',
  desc: 'Test the connection to the Certcache server',
  handler: test
}
