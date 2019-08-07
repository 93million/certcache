module.exports = (commonName, certName, altNames, extras, certbotConfig) => {
  const {isTest} = extras
  const {
    certbotConfigDir,
    certbotLogsDir,
    certbotWorkDir,
    certbotHttpAuthPort,
    letsencryptEmail
  } = certbotConfig
  if (letsencryptEmail === undefined) {
    throw new Error([
      'Missing email address to obtain letsencrypt certificates.',
      'Please provide env CERTCACHE_LETSENCRYPT_EMAIL'
    ].join(' '))
  }

  const certbotArgs = [
    'certonly',
    '--non-interactive',
    '--break-my-certs',
    '--standalone',
    '--agree-tos',
    '--no-eff-email',
    `-d`,
    [commonName, ...altNames].join(','),
    `--cert-name`,
    certName,
    `-m`,
    letsencryptEmail,
    `--config-dir`,
    certbotConfigDir,
    `--logs-dir`,
    certbotLogsDir,
    `--work-dir`,
    certbotWorkDir
  ]

  if (isTest) {
    certbotArgs.push('--test-cert')
  }

  if (certbotHttpAuthPort !== undefined) {
    certbotArgs.push('--http-01-port')
    certbotArgs.push(certbotHttpAuthPort)
  }

  return certbotArgs
}
