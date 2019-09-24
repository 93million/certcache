const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const fileExists = require('../../lib/helpers/fileExists')
const path = require('path')
const config = require('../../config')
const Certificate = require('../../lib/classes/Certificate')

const getLocalCerts = async () => {
  const certDir = path.resolve(config.certbotConfigDir, 'live')
  const dirItems = await readdir(certDir).catch(() => [])
  const certPaths = dirItems.map((item) => `${certDir}/${item}/cert.pem`)
  const existsArr = await Promise.all(certPaths.map(fileExists))

  return Promise.all(certPaths
    .filter((certPath, i) => existsArr[i])
    .map(async (certPath) => Certificate.fromPath(handlers, certPath))
  )
}

const handlers = {
  getBundle: require('./getBundle'),
  getLocalCerts,
  generateCert: require('./generateCert')
}

module.exports = getLocalCerts
