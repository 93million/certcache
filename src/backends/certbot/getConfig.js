const defaults = {
  certbotConfigDir: 'backends/certbot/config',
  certbotExec: 'certbot',
  certbotLogsDir: 'backends/certbot/logs',
  certbotWorkDir: 'backends/certbot/work'
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
    domains: (
      env.CERTCACHE_CERTBOT_DOMAINS &&
      env.CERTCACHE_CERTBOT_DOMAINS.split(',')
    ) ||
      file.domains,
    email: argv['certbot-email'] ||
      env.CERTCACHE_CERTBOT_EMAIL ||
      file.email
  }
}
