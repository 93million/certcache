const yaml = require('yaml')

const defaults = {
  server: {
    certbotConfigDir: 'extensions/certbot/config',
    certbotExec: 'certbot',
    certbotLogsDir: 'extensions/certbot/logs',
    certbotWorkDir: 'extensions/certbot/work',
    defaultChallenge: 'http-01',
    domains: []
  },
  client: {
    'test-cert': false
  }
}

module.exports = ({ argv, env, file }) => {
  return {
    client: {
      'test-cert': argv['test-cert'] ||
        env.CERTCACHE_TEST_CERT ||
        file.client['test-cert'] ||
        defaults.client['test-cert']
    },
    server: {
      certbotConfigDir: env.CERTCACHE_CERTBOT_CONFIG_DIR ||
        file.server.certbotConfigDir ||
        defaults.server.certbotConfigDir,
      certbotExec: env.CERTCACHE_CERTBOT_EXEC ||
        file.server.certbotExec ||
        defaults.server.certbotExec,
      certbotLogsDir: file.server.certbotLogsDir ||
        defaults.server.certbotLogsDir,
      certbotWorkDir: file.server.certbotWorkDir ||
        defaults.server.certbotWorkDir,
      defaultChallenge: argv['certbot-default-challenge'] ||
        env.CERTCACHE_CERTBOT_DEFAULT_CHALLENGE ||
        file.server.defaultChallenge ||
        defaults.server.defaultChallenge,
      domains: (
        env.CERTCACHE_CERTBOT_DOMAINS &&
        yaml.parse(env.CERTCACHE_CERTBOT_DOMAINS)
      ) ||
        file.server.domains ||
        defaults.server.domains,
      email: argv['certbot-email'] ||
        env.CERTCACHE_CERTBOT_EMAIL ||
        file.server.email
    }
  }
}
