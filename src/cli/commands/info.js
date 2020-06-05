const outputInfo = require('../../lib/client/outputInfo')
const { cahkeys, host } = require('./args')

module.exports = {
  cmd: 'info',
  desc: 'Display info about Certcache client and server',
  builder: { cahkeys, host },
  handler: outputInfo
}
