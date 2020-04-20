const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const fileExists = require('../../lib/helpers/fileExists')
const path = require('path')
const getConfig = require('../../lib/getConfig')
const Certificate = require('../../lib/classes/Certificate')
let handlers

const getLocalCerts = async () => {
  const config = (await getConfig()).extensions.certbot
  const certDir = path.resolve(config.certbotConfigDir, 'live')
  const dirItems = await readdir(certDir).catch(() => [])
  const certPaths = dirItems.map((item) => `${certDir}/${item}/cert.pem`)
  const existsArr = await Promise.all(certPaths.map(fileExists))

  if (handlers === undefined) {
    handlers = require('.')
  }

  return Promise.all(certPaths
    .filter((certPath, i) => existsArr[i])
    .map(async (certPath) => Certificate.fromPath(handlers, certPath))
  )
}

module.exports = getLocalCerts
