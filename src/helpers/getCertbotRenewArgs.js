module.exports = (config) => {
  const certbotArgs = [
    'renew',
    `--config-dir`,
    config.certbotConfigDir,
    `--logs-dir`,
    config.certbotLogsDir,
    `--work-dir`,
    config.certbotWorkDir,
    '-q'
  ]

  if (config.certbotHttpAuthPort !== undefined) {
    certbotArgs.push('--http-01-port')
    certbotArgs.push(config.certbotHttpAuthPort)
  }

  return certbotArgs
}
