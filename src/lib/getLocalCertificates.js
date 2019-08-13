const fs = require('fs')
const getCertInfo = require('./getCertInfo')
const util = require('util')
const fileExists = require('./helpers/fileExists')

const readdir = util.promisify(fs.readdir)

module.exports = async (certDir) => {
  const dirItems = await readdir(certDir).catch(() => [])
  const certPaths = dirItems.map((item) => `${certDir}${item}/cert.pem`)
  const existsArr = await Promise.all(certPaths.map(fileExists))

  return certPaths
    .filter((certPath, i) => existsArr[i])
    .map((certPath) => ({ ...getCertInfo(certPath), certPath }))
}
