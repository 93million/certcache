const path = require('path')

module.exports.certcacheHost = 'localhost'
module.exports.certcachePort = 4433
module.exports.certcacheCertDir = path.resolve(__dirname, '/../../certs/')
module.exports.certbotExec = 'certbot'
module.exports.certbotConfigDir = path.resolve(
  __dirname,
  '/../../certbot/config/'
)
module.exports.certbotLogsDir = path.resolve(__dirname, '/../../certbot/logs/')
module.exports.certbotWorkDir = path.resolve(__dirname, '/../../certbot/work/')
module.exports.certcacheTmpDir = '/tmp/certcache/'
