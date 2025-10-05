/* global expect test */

const getCertbotCertonlyArgs = require('./getCertbotCertonlyArgs')

const commonName = 'example.com'
const certName = 'abcd1234'
const altNames = [
  'www.example.com',
  'foo.example.com',
  'abcd.1234',
  'example.com'
]
const email = 'test@example.com'
const certbotConfigDir = '/test/certbot/config/'
const certbotLogsDir = '/test/certbot/logs/'
const certbotWorkDir = '/test/certbot/work/'
const extraArgs = ['--foo', 'faa']

const certbotArgsArr = getCertbotCertonlyArgs(
  commonName,
  altNames,
  certName,
  { isTest: true },
  {
    certbotConfigDir,
    certbotLogsDir,
    certbotWorkDir,
    email
  },
  extraArgs
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
  () => { expect(certbotArgs).toContain(`-m ${email}`) }
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
      altNames,
      certName,
      { isTest: false },
      {
        certbotConfigDir,
        certbotLogsDir,
        certbotWorkDir,
        email
      },
      extraArgs
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
        altNames,
        certName,
        { isTest: false },
        { certbotConfigDir, certbotLogsDir, certbotWorkDir },
        extraArgs
      )
    }

    expect(getCertbotCertonlyArgsWithMissingEmail).toThrow()
  }
)

test(
  'should provide a list of unique (not repeating) domain names',
  () => {
    const certbotArgs = getCertbotCertonlyArgs(
      commonName,
      [...altNames, commonName],
      certName,
      { isTest: false },
      { certbotConfigDir, certbotLogsDir, certbotWorkDir, email },
      extraArgs
    )

    const domainRepeatCounts = certbotArgs[certbotArgs.indexOf('-d') + 1]
      .split(',')
      .map((domain, i, domains) => (
        domains.filter((_domain) => (_domain === domain))
      ).length)

    expect(Math.max(...domainRepeatCounts)).toBe(1)
  }
)

test(
  'should add any extra args supplied',
  () => {
    const certbotArgs = getCertbotCertonlyArgs(
      'foo.93million.com',
      [],
      certName,
      { isTest: false },
      { certbotConfigDir, certbotLogsDir, certbotWorkDir, email },
      extraArgs
    )

    expect(certbotArgs).toEqual(expect.arrayContaining(extraArgs))
  }
)

test(
  'should contain key-type if supplied',
  () => {
    const keyType = 'testType'
    const certbotArgs = getCertbotCertonlyArgs(
      'foo.93million.com',
      [],
      certName,
      { keyType },
      { certbotConfigDir, certbotLogsDir, certbotWorkDir, email },
      extraArgs
    )

    expect(certbotArgs).toEqual(expect.arrayContaining(['--key-type', keyType]))
  }
)

test(
  'should contain elliptic-curve if supplied',
  () => {
    const ellipticCurve = 'secp256r1'
    const certbotArgs = getCertbotCertonlyArgs(
      'foo.93million.com',
      [],
      certName,
      { ellipticCurve },
      { certbotConfigDir, certbotLogsDir, certbotWorkDir, email },
      extraArgs
    )

    expect(certbotArgs)
      .toEqual(expect.arrayContaining(['--elliptic-curve', ellipticCurve]))
  }
)

test(
  'should contain eab kid if supplied',
  () => {
    const eabKid = 'eab-kid'
    const certbotArgs = getCertbotCertonlyArgs(
      commonName,
      altNames,
      certName,
      { isTest: true },
      {
        certbotConfigDir,
        certbotLogsDir,
        certbotWorkDir,
        email,
        eabKid
      },
      extraArgs
    )

    expect(certbotArgs)
      .toEqual(expect.arrayContaining(['--eab-kid', eabKid]))
  }
)

test(
  'should contain eab hmac key if supplied',
  () => {
    const eabHmacKey = 'eab-hmac-key'
    const certbotArgs = getCertbotCertonlyArgs(
      commonName,
      altNames,
      certName,
      { isTest: true },
      {
        certbotConfigDir,
        certbotLogsDir,
        certbotWorkDir,
        email,
        eabHmacKey
      },
      extraArgs
    )

    expect(certbotArgs)
      .toEqual(expect.arrayContaining(['--eab-hmac-key', eabHmacKey]))
  }
)


test(
  'should contain server if supplied',
  () => {
    const server = 'server'
    const certbotArgs = getCertbotCertonlyArgs(
      commonName,
      altNames,
      certName,
      { isTest: true },
      {
        certbotConfigDir,
        certbotLogsDir,
        certbotWorkDir,
        email,
        server
      },
      extraArgs
    )

    expect(certbotArgs)
      .toEqual(expect.arrayContaining(['--server', server]))
  }
)
