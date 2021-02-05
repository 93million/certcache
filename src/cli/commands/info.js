const outputInfo = require('../../lib/client/outputInfo')
const { catkeys, upstream } = require('./args')

module.exports = {
  cmd: 'info',
  desc: 'Display info about Certcache client and server',
  builder: { catkeys, upstream },
  handler: outputInfo
}
