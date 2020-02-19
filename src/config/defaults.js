const path = require('path')

module.exports.certcacheHost = 'localhost'
module.exports.certcachePort = 4433
module.exports.certcacheCertDir = path.resolve(process.cwd(), 'certs')
module.exports.certbotExec = 'certbot'
module.exports.certbotConfigDir = path.resolve(
  process.cwd(),
  'backends',
  'certbot',
  'config'
)
module.exports.certbotLogsDir = path.resolve(
  process.cwd(),
  'backends',
  'certbot',
  'logs'
)
module.exports.certbotWorkDir = path.resolve(
  process.cwd(),
  'backends',
  'certbot',
  'work'
)
// XXX is `certcacheTmpDir` used?
module.exports.certcacheTmpDir = '/tmp/certcache/'
module.exports.renewDaysBefore = 30
module.exports.clientSyncInterval = 60 * 60 * 6
module.exports.thirdpartyDir = path.resolve(
  process.cwd(),
  'backends',
  'thirdparty'
)
