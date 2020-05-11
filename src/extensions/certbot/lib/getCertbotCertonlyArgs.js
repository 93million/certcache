module.exports = (
  commonName,
  altNames,
  certName,
  { isTest },
  { certbotConfigDir, certbotLogsDir, certbotWorkDir, email },
  extraArgs
) => {
  if (email === undefined) {
    throw new Error([
      'Missing email address to obtain letsencrypt certificates.',
      'Please provide env CERTCACHE_CERTBOT_EMAIL, pass in using cli',
      'arg --certbot-email or specify in config.json at',
      'extensions.certbot.email'
    ].join(' '))
  }

  const domains = Array.from(new Set([commonName, ...altNames]))
  const certbotArgs = [
    'certonly',
    '--non-interactive',
    '--break-my-certs',
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
    '--force-renewal',
    ...extraArgs
  ]

  if (isTest) {
    certbotArgs.push('--test-cert')
  }

  return certbotArgs
}
