const getCertbotRenewArgs = require('./getCertbotRenewArgs')

const defaultConfig = {
  certbotConfigDir: '/test/certbot/config',
  certbotLogsDir: '/test/certbot/logs',
  certbotWorkDir: '/test/certbot/work'
}

const certbotDefaultArgs = getCertbotRenewArgs(defaultConfig)
const certbotDefaultArgsStr = certbotDefaultArgs.join(' ')

test(
  'should pass \'renew\' as first argument',
  () => { expect(certbotDefaultArgs[0]).toBe('renew') }
)

test(
  'should specify config dir',
  () => {
    expect(certbotDefaultArgsStr)
      .toContain(`--config-dir ${defaultConfig.certbotConfigDir}`)
  }
)

test(
  'should specify logs dir',
  () => {
    expect(certbotDefaultArgsStr)
      .toContain(`--logs-dir ${defaultConfig.certbotLogsDir}`)
  }
)

test(
  'should specify work dir',
  () => {
    expect(certbotDefaultArgsStr)
      .toContain(`--work-dir ${defaultConfig.certbotWorkDir}`)
  }
)

test(
  'should not include http auth port when not requested',
  () => {
    expect(certbotDefaultArgsStr)
      .not
      .toContain(`--http-01-port`)
  }
)

test(
  'should include http auth port when requested',
  () => {
    const certbotHttpAuthPort = '58008'

    expect(getCertbotRenewArgs({
      ...defaultConfig,
      certbotHttpAuthPort
    }).join(' '))
      .toContain(`--http-01-port ${certbotHttpAuthPort}`)
  }
)
