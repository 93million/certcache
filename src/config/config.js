const defaults = require('./defaults')
const yaml = require('yaml')

module.exports = ({ argv, env, file }) => {
  return {
    cahKeysDir: argv.cahkeys ||
      env.CERTCACHE_CAH_KEYS_DIR ||
      file.cahKeysDir ||
      defaults.cahKeysDir,
    certDir: env.CERTCACHE_CERTS_DIR ||
      file.certDir ||
      defaults.certDir,
    certs: (env.CERTCACHE_CERTS && yaml.parse(env.CERTCACHE_CERTS)) ||
      file.certs ||
      defaults.certs,
    renewalDays: argv.days ||
      env.CERTCACHE_DAYS_RENEWAL ||
      file.renewalDays ||
      defaults.renewalDays,
    server: {
      port: env.CERTCACHE_PORT || file.server.port || defaults.server.port,
      clientRestrictions: (
        env.CERTCACHE_CLIENT_CERT_RESTRICTIONS &&
        yaml.parse(env.CERTCACHE_CLIENT_CERT_RESTRICTIONS)
      ) ||
        file.server.clientRestrictions
    },
    syncInterval: argv.interval ||
      env.CERTCACHE_SYNC_INTERVAL ||
      file.syncInterval ||
      defaults.syncInterval,
    upstream: argv.host ||
      env.CERTCACHE_UPSTREAM ||
      file.upstream ||
      defaults.upstream
  }
}
