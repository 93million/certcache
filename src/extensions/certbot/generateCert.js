const generateCertName = require('./lib/generateCertName')
const getCertbotCertonlyArgs = require('./lib/getCertbotCertonlyArgs')
const debug = require('debug')('certcache:generateCert')
const execCertbot = require('./lib/execCertbot')
const getConfig = require('../../lib/getConfig')
const getChallengeFromDomains = require('./lib/getChallengeFromDomains')
const FeedbackError = require('../../lib/FeedbackError')

const certsInGeneration = {}

module.exports = async (commonName, altNames, meta) => {
  const certName = generateCertName(commonName, altNames, meta)
  let certbotConfig

  if (certsInGeneration[certName] === undefined) {
    certsInGeneration[certName] = (async () => {
      const domains = Array.from(new Set([commonName, ...altNames]))
      const certbotConfig = (await getConfig()).extensions.certbot
      const challenge = await getChallengeFromDomains(
        certbotConfig.domains,
        domains,
        certbotConfig.defaultChallenge
      )

      if (challenge === undefined) {
        throw new FeedbackError([
          'Unable to find a common certbot challenge to generate the requested',
          'combination of domains:',
          domains.join(', ')
        ].join(' '))
      }

      const certbotArgs = getCertbotCertonlyArgs(
        commonName,
        altNames,
        certName,
        meta,
        certbotConfig,
        challenge.args
      )
      debug(
        'Generating certificate by calling',
        certbotConfig.certbotExec,
        certbotArgs.join(' ')
      )

      await execCertbot(
        certbotConfig.certbotExec,
        certbotArgs,
        { env: { ...process.env, ...challenge.environment } }
      )

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
