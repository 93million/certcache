const defaults = require('./defaults')
const yaml = require('yaml')

module.exports = ({ argv, env, file }) => ({
  client: {
    certDir: env.CERTCACHE_CERTS_DIR ||
      file.client.certDir ||
      defaults.client.certDir,
    certs: (env.CERTCACHE_CERTS && yaml.parse(env.CERTCACHE_CERTS)) ||
      file.client.certs ||
      defaults.client.certs,
    host: argv.host ||
      env.CERTCACHE_HOST ||
      file.client.host ||
      defaults.client.host,
    port: argv.port ||
      env.CERTCACHE_PORT ||
      file.client.port ||
      defaults.client.port,
    renewalDays: argv.days ||
      env.CERTCACHE_DAYS_RENEWAL ||
      file.client.renewalDays ||
      defaults.client.renewalDays,
    syncInterval: argv.interval ||
      env.CERTCACHE_SYNC_INTERVAL ||
      file.client.syncInterval ||
      defaults.client.syncInterval
  },
  server: {
    port: env.CERTCACHE_PORT || file.server.port || defaults.server.port,
    auth: (env.CERTCACHE_AUTH && yaml.parse(env.CERTCACHE_AUTH)) ||
      file.server.auth ||
      defaults.server.auth,
    clientRestrictions: (
      env.CERTCACHE_CLIENT_CERT_RESTRICTIONS &&
      yaml.parse(env.CERTCACHE_CLIENT_CERT_RESTRICTIONS)
    ) ||
      file.server.clientRestrictions
  },
  cahKeysDir: argv.cahkeys ||
    env.CERTCACHE_CAH_KEYS_DIR ||
    file.cahKeysDir ||
    defaults.cahKeysDir
})
