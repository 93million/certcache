const defaults = require('./defaults')
const yaml = require('yaml')

module.exports = ({ argv, env, file }) => ({
  client: {
    domains: (env.CERTCACHE_DOMAINS && yaml.parse(env.CERTCACHE_DOMAINS)) ||
      file.client.domains ||
      defaults.client.domains,
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
    syncInterval: env.CERTCACHE_SYNC_INTERVAL ||
      file.client.syncInterval ||
      defaults.client.syncInterval,
    renewalDays: argv.days ||
      env.CERTCACHE_DAYS_RENEWAL ||
      file.client.renewalDays ||
      defaults.client.renewalDays
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
    file.cahkeys ||
    defaults.cahkeys
})
