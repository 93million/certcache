const child_process = require('child_process')
const util = require('util')
const md5 = require('md5')

const execFile = util.promisify(child_process.execFile)

const generateHash = (commonName, altNames, isTest) => md5(JSON.stringify({
  commonName,
  altNames: altNames.map((name) => name.toLowerCase()).sort(),
  isTest
}))

const certsInGeneration = {}

module.exports = async (commonName, altNames, isTest) => {
  const certName = generateHash(commonName, altNames, isTest)
  const certbotExec = process.env.CERTCACHE_LETSENCRYPT_EXEC || 'certbot'
  const letsEncrpytConfigDir = process.env.CERTCACHE_LETSENCRYPT_CONFIG_DIR ||
    __dirname + '/../../letsencrypt/config/'
  const email = process.env.CERTCACHE_LETSENCRYPT_EMAIL
  const letsEncrpytWorkDir = __dirname + '/../../letsencrypt/work/'
  const letsEncrpytLogsDir = __dirname + '/../../letsencrypt/logs/'

  if (email === undefined) {
    throw new Error([
      'Missing email address to obtain letsencrypt certificates.',
      'Please provide env CERTCACHE_LETSENCRYPT_EMAIL'
    ].join(' '))
  }

  if (certsInGeneration[certName] === undefined) {
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
      email,
      `--config-dir`,
      letsEncrpytConfigDir,
      `--logs-dir`,
      letsEncrpytLogsDir,
      `--work-dir`,
      letsEncrpytWorkDir
    ]

    if (isTest) {
      certbotArgs.push('--test-cert')
    }

    certsInGeneration[certName] = execFile(certbotExec, certbotArgs)
  }

  try {
    await certsInGeneration[certName]
  } finally {
    delete certsInGeneration[certName]
  }

  return `${letsEncrpytConfigDir}/live/${certName}`
}
