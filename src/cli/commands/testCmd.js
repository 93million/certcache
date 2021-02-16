const test = require('../../lib/client/testCmd')
const { catkeys, upstream } = require('./args')

module.exports = {
  cmd: 'test',
  desc: 'Test the connection to the Certcache server',
  builder: { catkeys, upstream },
  handler: test
}
