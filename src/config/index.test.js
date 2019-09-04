/* global test expect */

test('should respect env vars when creating config', () => {
  const testWithEnvVars = (envVarsOverrides) => {
    for (const i in envVarsOverrides) {
      process.env[i] = envVarsOverrides[i]
    }

    const config = require('.')
    const envVarMaps = [
      ['CERTCACHE_HOST', 'certcacheHost'],
      ['CERTCACHE_PORT', 'certcachePort'],
      ['CERTCACHE_CERT_DIR', 'certcacheCertDir'],
      ['CERTCACHE_CERTBOT_EXEC', 'certbotExec'],
      ['CERTCACHE_CERTBOT_CONFIG_DIR', 'certbotConfigDir'],
      ['CERTCACHE_LETSENCRYPT_EMAIL', 'letsencryptEmail'],
      ['CERTCACHE_TMP_DIR', 'certcacheTmpDir'],
      ['CERTCACHE_CERTBOT_HTTP_AUTH_PORT', 'certbotHttpAuthPort'],
      ['CERTCACHE_HTTP_REDIRECT_URL', 'httpRedirectUrl'],
      ['CERTCACHE_RENEW_DAYS_BEFORE', 'renewDaysBefore']
    ]
    const numericEnvVars = ['CERTCACHE_RENEW_DAYS_BEFORE']

    envVarMaps.forEach(([envVar, configProp]) => {
      let val = envVarsOverrides[envVar]

      if (numericEnvVars.includes(envVar)) {
        val = Number(val)
      }

      expect(config[configProp]).toBe(val)
    })
  }

  testWithEnvVars({
    CERTCACHE_HOST: 'testhost',
    CERTCACHE_PORT: 'testport',
    CERTCACHE_CERT_DIR: '/test/cert/dir',
    CERTCACHE_CERTBOT_EXEC: 'testcertbotexec',
    CERTCACHE_CERTBOT_CONFIG_DIR: '/test/certbot/config/dir',
    CERTCACHE_LETSENCRYPT_EMAIL: 'test@example.com',
    CERTCACHE_TMP_DIR: '/test/tmp/dir',
    CERTCACHE_CERTBOT_HTTP_AUTH_PORT: 'testcertbotauthport',
    CERTCACHE_HTTP_REDIRECT_URL: 'http://test.http/redirect?url',
    CERTCACHE_RENEW_DAYS_BEFORE: '30'
  })
})
