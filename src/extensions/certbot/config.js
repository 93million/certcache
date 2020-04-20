const yaml = require('yaml')

const defaults = {
  certbotConfigDir: 'extensions/certbot/config',
  certbotExec: 'certbot',
  certbotLogsDir: 'extensions/certbot/logs',
  certbotWorkDir: 'extensions/certbot/work',
  defaultChallenge: 'http-01',
  domains: [],
  'test-cert': false
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
    email: argv['certbot-email'] ||
      env.CERTCACHE_CERTBOT_EMAIL ||
      file.email,
    'test-cert': argv['test-cert'] ||
      env.CERTCACHE_TEST_CERT === '1' ||
      file['test-cert'] ||
      defaults['test-cert']
  }
}
