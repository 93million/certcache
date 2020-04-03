const defaults = {
  server: {
    certbotConfigDir: 'backends/certbot/config',
    certbotExec: 'certbot',
    certbotLogsDir: 'backends/certbot/logs',
    certbotWorkDir: 'backends/certbot/work'
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
      domains: (
        env.CERTCACHE_CERTBOT_DOMAINS &&
        env.CERTCACHE_CERTBOT_DOMAINS.split(',')
      ) ||
        file.server.domains,
      email: argv['certbot-email'] ||
        env.CERTCACHE_CERTBOT_EMAIL ||
        file.server.email
    }
  }
}
