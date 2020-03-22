module.exports = (
  commonName,
  certName,
  altNames,
  { isTest },
  {
    certbotConfigDir,
    certbotLogsDir,
    certbotWorkDir,
    email
  }
) => {
  if (email === undefined) {
    throw new Error([
      'Missing email address to obtain letsencrypt certificates.',
      'Please provide env CERTCACHE_CERTBOT_EMAIL, pass in using cli',
      'arg --email or put in config.json at server.backends.certbot.email'
    ].join(' '))
  }

  const domains = Array.from(new Set([commonName, ...altNames]))
  const certbotArgs = [
    'certonly',
    '--non-interactive',
    '--break-my-certs',
    '--standalone',
    '--agree-tos',
    '--no-eff-email',
    `-d`,
    domains.join(','),
    `--cert-name`,
    certName,
    `-m`,
    email,
    `--config-dir`,
    certbotConfigDir,
    `--logs-dir`,
    certbotLogsDir,
    `--work-dir`,
    certbotWorkDir,
    '--force-renewal'
  ]

  if (isTest) {
    certbotArgs.push('--test-cert')
  }

  return certbotArgs
}
