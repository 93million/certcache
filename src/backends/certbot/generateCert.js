const generateCertName = require('../../lib/generateCertName')
const getCertbotCertonlyArgs = require('./lib/getCertbotCertonlyArgs')
const debug = require('debug')('certcache:generateCert')
const execCertbot = require('./lib/execCertbot')
const getConfig = require('../../lib/getConfig')

const certsInGeneration = {}

module.exports = async (commonName, altNames, { isTest }) => {
  const certName = generateCertName(commonName, altNames, { isTest })
  let certbotConfig

  if (certsInGeneration[certName] === undefined) {
    certsInGeneration[certName] = (async () => {
      const certbotConfig = (await getConfig()).server.backends.certbot

      const certbotArgs = getCertbotCertonlyArgs(
        commonName,
        certName,
        altNames,
        { isTest },
        certbotConfig
      )
      debug(
        'Generating certificate by calling',
        certbotConfig.certbotExec,
        certbotArgs.join(' ')
      )

      await execCertbot(certbotConfig.certbotExec, certbotArgs)

      return certbotConfig
    })()
  }

  try {
    certbotConfig = await certsInGeneration[certName]
    debug('Generated cert successfully using certbot')
  } catch (e) {
    debug('Cert generation failed using certbot', e)
    throw e
  } finally {
    delete certsInGeneration[certName]
  }

  return `${certbotConfig.certbotConfigDir}/live/${certName}/cert.pem`
}
