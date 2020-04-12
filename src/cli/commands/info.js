const outputInfo = require('../../lib/client/outputInfo')

module.exports = {
  cmd: 'info',
  desc: 'Test the connection to the Certcache server',
  handler: () => {
    outputInfo()
  }
}
