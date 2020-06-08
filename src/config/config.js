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
    httpRedirectUrl: argv['http-redirect-url'] ||
      process.env.CERTCACHE_HTTP_REDIRECT_URL ||
      file.httpRedirectUrl,
    renewalDays: (argv.days && Number(argv.days)) ||
      (env.CERTCACHE_DAYS_RENEWAL && Number(env.CERTCACHE_DAYS_RENEWAL)) ||
      file.renewalDays ||
      defaults.renewalDays,
    server: {
      port: argv.port ||
        env.CERTCACHE_PORT ||
        file.server.port ||
        defaults.server.port,
      domainAccess: (
        env.CERTCACHE_DOMAIN_ACCESS &&
        yaml.parse(env.CERTCACHE_DOMAIN_ACCESS)
      ) ||
        file.server.domainAccess
    },
    skipFilePerms: argv['skip-file-perms'] ||
      env.CERTCACHE_SKIP_FILE_PERMS === '1' ||
      file.skipFilePerms ||
      defaults.skipFilePerms,
    syncInterval: argv.interval ||
      env.CERTCACHE_SYNC_INTERVAL ||
      file.syncInterval ||
      defaults.syncInterval,
    upstream: argv.upstream ||
      env.CERTCACHE_UPSTREAM ||
      file.upstream ||
      defaults.upstream
  }
}
