const child_process = require('child_process')
const util = require('util')
const config = require('../config')
const generateCertName = require('./generateCertName')
const getCertbotCertonlyArgs = require('./getCertbotCertonlyArgs')

const execFile = util.promisify(child_process.execFile)

const certsInGeneration = {}

module.exports = async (commonName, altNames, isTest, certbotConfig) => {
  const {certbotExec, certbotConfigDir} = certbotConfig
  const certName = generateCertName(commonName, altNames, isTest)

  if (certsInGeneration[certName] === undefined) {
    const certbotArgs = getCertbotCertonlyArgs(
      commonName,
      certName,
      altNames,
      isTest,
      certbotConfig
    )

    certsInGeneration[certName] = execFile(certbotExec, certbotArgs)
  }

  try {
    await certsInGeneration[certName]
  } finally {
    delete certsInGeneration[certName]
  }

  return `${certbotConfigDir}/live/${certName}`
}
