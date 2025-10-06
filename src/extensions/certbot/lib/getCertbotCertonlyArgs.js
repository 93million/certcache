module.exports = (
  commonName,
  altNames,
  certName,
  { isTest, keyType, ellipticCurve },
  {
    certbotConfigDir,
    certbotLogsDir,
    certbotWorkDir,
    eabKid,
    eabHmacKey,
    email,
    server
  },
  extraArgs
) => {
  const conditionalArgs = []

  if (email !== undefined) {
    conditionalArgs.push('-m')
    conditionalArgs.push(email)
  } else {
    conditionalArgs.push('--register-unsafely-without-email')
  }

  if (isTest) {
    conditionalArgs.push('--test-cert')
  }

  if (keyType !== undefined) {
    conditionalArgs.push('--key-type')
    conditionalArgs.push(keyType)
  }

  if (ellipticCurve !== undefined) {
    conditionalArgs.push('--elliptic-curve')
    conditionalArgs.push(ellipticCurve)
  }

  if (eabKid !== undefined) {
    conditionalArgs.push('--eab-kid', eabKid)
  }

  if (eabHmacKey !== undefined) {
    conditionalArgs.push('--eab-hmac-key', eabHmacKey)
  }

  if (server !== undefined) {
    conditionalArgs.push('--server', server)
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
    `--config-dir`,
    certbotConfigDir,
    `--logs-dir`,
    certbotLogsDir,
    `--work-dir`,
    certbotWorkDir,
    '--force-renewal',
    ...conditionalArgs,
    ...extraArgs
  ]

  return certbotArgs
}
