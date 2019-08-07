const getCertbotCertonlyArgs = require('./getCertbotCertonlyArgs')

const commonName = 'example.com'
const certName = 'abcd1234'
const altNames = ['www.example.com', 'foo.example.com', 'abcd.1234']
const letsencryptEmail = 'test@example.com'
const certbotConfigDir = '/test/certbot/config/'
const certbotLogsDir = '/test/certbot/logs/'
const certbotWorkDir = '/test/certbot/work/'
const certbotHttpAuthPort = '12345'
const certbotArgsArr = getCertbotCertonlyArgs(
  commonName,
  certName,
  altNames,
  {isTest: true},
  {
    certbotConfigDir,
    certbotLogsDir,
    certbotWorkDir,
    certbotHttpAuthPort,
    letsencryptEmail
  }
)
const certbotArgs = certbotArgsArr.join(' ')

test(
  'should pass \'certonly\' as first argument',
  () => {
    expect(certbotArgsArr[0]).toBe('certonly')
  }
)

test(
  'should contain common name followed by all alt names',
  () => {
    expect(certbotArgs)
      .toContain('-d example.com,www.example.com,foo.example.com,abcd.1234')
  }
)

test(
  'should contain letsencrypt account email address',
  () => { expect(certbotArgs).toContain(`-m ${letsencryptEmail}`) }
)

test(
  'should contain test cert flag',
  () => { expect(certbotArgs).toContain('--test-cert') }
)

test(
  'should contain cert name',
  () => { expect(certbotArgs).toContain(`--cert-name ${certName}`) }
)

test(
  'should contain certbot work dir',
  () => { expect(certbotArgs).toContain(`--work-dir ${certbotWorkDir}`) }
)

test(
  'should contain certbot logs dir',
  () => { expect(certbotArgs).toContain(`--logs-dir ${certbotLogsDir}`) }
)

test(
  'should contain certbot config dir',
  () => {
    expect(certbotArgs).toContain(`--config-dir ${certbotConfigDir}`)
  }
)

test(
  'should not include test cert flag unless specified',
  () => {
    const certbotArgsNoTest = getCertbotCertonlyArgs(
      commonName,
      certName,
      altNames,
      false,
      {
        certbotConfigDir,
        certbotLogsDir,
        certbotWorkDir,
        certbotHttpAuthPort,
        letsencryptEmail
      }
    ).join(' ')

    expect(certbotArgsNoTest).not.toContain('--test-cert')
  }
)

test(
  'should throw an error when called without letsencrypt account email address',
  () => {
    const getCertbotCertonlyArgsWithMissingEmail = () => {
      getCertbotCertonlyArgs(
        commonName,
        certName,
        altNames,
        false,
        {
          certbotConfigDir,
          certbotLogsDir,
          certbotWorkDir,
          certbotHttpAuthPort
        }
      )
    }

    expect(getCertbotCertonlyArgsWithMissingEmail).toThrow()
  }
)
