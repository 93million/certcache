const outputInfo = require('../../lib/client/outputInfo')
const { cahkeys, upstream } = require('./args')

module.exports = {
  cmd: 'info',
  desc: 'Display info about Certcache client and server',
  builder: { cahkeys, upstream },
  handler: outputInfo
}
