const yaml = require('yaml')

const defaults = {
  certbotConfigDir: 'cache/certbot/config',
  certbotExec: 'certbot',
  certbotLogsDir: 'cache/certbot/logs',
  certbotWorkDir: 'cache/certbot/work',
  challenges: {},
  defaultChallenge: 'dns-01',
  domains: ['~.'],
  'test-cert': false,
  server: undefined
}

module.exports = ({ argv, env, file }) => {
  return {
    certbotConfigDir: env.CERTCACHE_CERTBOT_CONFIG_DIR ||
      file.certbotConfigDir ||
      defaults.certbotConfigDir,
    certbotExec: env.CERTCACHE_CERTBOT_EXEC ||
      file.certbotExec ||
      defaults.certbotExec,
    certbotLogsDir: file.certbotLogsDir ||
      defaults.certbotLogsDir,
    certbotWorkDir: file.certbotWorkDir ||
      defaults.certbotWorkDir,
    challenges: (
      env.CERTCACHE_CERTBOT_CHALLENGES &&
      yaml.parse(env.CERTCACHE_CERTBOT_CHALLENGES)
    ) ||
      file.challenges ||
      defaults.challenges,
    defaultChallenge: argv['certbot-default-challenge'] ||
      env.CERTCACHE_CERTBOT_DEFAULT_CHALLENGE ||
      file.defaultChallenge ||
      defaults.defaultChallenge,
    domains: (
      env.CERTCACHE_CERTBOT_DOMAINS &&
      yaml.parse(env.CERTCACHE_CERTBOT_DOMAINS)
    ) ||
      file.domains ||
      defaults.domains,
    eabKid: env.CERTCACHE_CERTBOT_EAB_KID ||
      file.eabKid,
    eabHmacKey: env.CERTCACHE_CERTBOT_EAB_HMAC_KEY ||
      file.eabHmacKey,
    email: argv['certbot-email'] ||
      env.CERTCACHE_CERTBOT_EMAIL ||
      file.email,
    server: env.CERTCACHE_CERTBOT_SERVER ||
      file.server ||
      defaults.server,
    'test-cert': argv['test-cert'] ||
      env.CERTCACHE_TEST_CERT === '1' ||
      file['test-cert'] ||
      defaults['test-cert']
  }
}
