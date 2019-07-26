module.exports.certcacheHost = process.env.CERTCACHE_HOST || 'localhost'
module.exports.certcachePort = process.env.CERTCACHE_PORT || 4433
module.exports.certcacheCertDir = process.env.CERTCACHE_CERT_DIR ||
  __dirname + '/../../certs/'
module.exports.certbotExec = process.env.CERTCACHE_CERTBOT_EXEC || 'certbot'
module.exports.certbotConfigDir = process.env.CERTCACHE_CERTBOT_CONFIG_DIR ||
  __dirname + '/../../certbot/config/'
module.exports.letsencryptEmail = process.env.CERTCACHE_LETSENCRYPT_EMAIL
module.exports.certcacheTmpDir = process.env.CERTCACHE_TMP_DIR ||
  '/tmp/certcache/'
module.exports.certbotHttpAuthPort = process.env.CERTCACHE_CERTBOT_HTTP_AUTH_PORT
