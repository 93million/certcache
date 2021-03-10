const defaults = require('./defaults')
const yaml = require('yaml')

module.exports = async ({ argv, env, file }) => {
  const _defaults = await defaults()

  return {
    binDir: env.CERTCACHE_BIN_DIR ||
      file.binDir ||
      _defaults.binDir,
    catKeysDir: argv.catkeys ||
      env.CERTCACHE_CAH_KEYS_DIR ||
      file.catKeysDir ||
      _defaults.catKeysDir,
    certDir: env.CERTCACHE_CERTS_DIR ||
      file.certDir ||
      _defaults.certDir,
    certs: (env.CERTCACHE_CERTS && yaml.parse(env.CERTCACHE_CERTS)) ||
      file.certs ||
      _defaults.certs,
    ellipticCurve: argv['elliptic-curve'] ||
      env.CERTCACHE_ELLIPTIC_CURVE ||
      file.ellipticCurve ||
      _defaults.ellipticCurve,
    httpRedirectUrl: argv['http-redirect-url'] ||
      env.CERTCACHE_HTTP_REDIRECT_URL ||
      file.httpRedirectUrl,
    httpRequestInterval: file.httpRequestInterval ||
      _defaults.httpRequestInterval,
    keyType: argv['key-type'] ||
      env.CERTCACHE_KEY_TYPE ||
      file.keyType ||
      _defaults.keyType,
    maxRequestTime: (
      argv['max-request-time'] &&
      Number(argv['max-request-time'])
    ) ||
      (
        env.CERTCACHE_MAX_REQUEST_TIME &&
        Number(env.CERTCACHE_MAX_REQUEST_TIME)
      ) ||
      file.maxRequestTime ||
      _defaults.maxRequestTime,
    renewalDays: (argv.days && Number(argv.days)) ||
      (env.CERTCACHE_DAYS_RENEWAL && Number(env.CERTCACHE_DAYS_RENEWAL)) ||
      file.renewalDays ||
      _defaults.renewalDays,
    server: {
      port: argv.port ||
        env.CERTCACHE_PORT ||
        file.server.port ||
        _defaults.server.port,
      domainAccess: (
        env.CERTCACHE_DOMAIN_ACCESS &&
        yaml.parse(env.CERTCACHE_DOMAIN_ACCESS)
      ) ||
        file.server.domainAccess
    },
    skipFilePerms: argv['skip-file-perms'] ||
      env.CERTCACHE_SKIP_FILE_PERMS === '1' ||
      file.skipFilePerms ||
      _defaults.skipFilePerms,
    syncInterval: argv.interval ||
      env.CERTCACHE_SYNC_INTERVAL ||
      file.syncInterval ||
      _defaults.syncInterval,
    upstream: argv.upstream ||
      env.CERTCACHE_UPSTREAM ||
      file.upstream ||
      _defaults.upstream
  }
}
