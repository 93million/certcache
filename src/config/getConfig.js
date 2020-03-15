const defaults = require('./defaults')
const yaml = require('yaml')

module.exports = ({ argv, env, file }) => ({
  client: {
    host: argv.host ||
      env.CERTCACHE_HOST ||
      file.client.host ||
      defaults.client.host,
    port: argv.port ||
      env.CERTCACHE_PORT ||
      file.client.port ||
      defaults.client.port,
    certDir: env.CERTCACHE_CERTS_DIR ||
      file.client.certDir ||
      defaults.client.certDir,
    syncInterval: 60 * 60 * 6,
    renewalDays: argv.days ||
      env.CERTCACHE_DAYS_RENEWAL ||
      file.renewalDays ||
      defaults.client.renewalDays
  },
  server: {
    port: env.CERTCACHE_PORT ||
      file.server.port ||
      defaults.server.port,
    auth: (env.CERTCACHE_AUTH && yaml.parse(env.CERTCACHE_AUTH)) ||
      file.server.auth ||
      defaults.server.auth
  },
  cahKeysDir: argv.cahkeys || env.CERTCACHE_CAH_KEYS_DIR
})
