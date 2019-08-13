const generateCertName = require('../../lib/generateCertName')
const getCertbotCertonlyArgs = require('./lib/getCertbotCertonlyArgs')
const debug = require('debug')('certcache:generateCert')
const execCertbot = require('./lib/execCertbot')

const certsInGeneration = {}

module.exports = async (commonName, altNames, extras, certbotConfig) => {
  const { certbotExec, certbotConfigDir } = certbotConfig
  const certName = generateCertName(commonName, altNames, extras)

  if (certsInGeneration[certName] === undefined) {
    const certbotArgs = getCertbotCertonlyArgs(
      commonName,
      certName,
      altNames,
      extras,
      certbotConfig
    )

    certsInGeneration[certName] = execCertbot(certbotExec, certbotArgs)

    debug(
      'Generating certificate by calling',
      certbotExec,
      certbotArgs.join(' ')
    )
  }

  let output

  try {
    output = await certsInGeneration[certName]
    debug('Generated cert successfully using certbot', output)
  } catch (e) {
    debug('Cert generation failed using certbot', e)
    throw e
  } finally {
    delete certsInGeneration[certName]
  }

  return `${certbotConfigDir}/live/${certName}/cert.pem`
}
