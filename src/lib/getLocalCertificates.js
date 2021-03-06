const fs = require('fs')
const getCertInfoFromPath = require('./getCertInfoFromPath')
const util = require('util')
const fileExists = require('./helpers/fileExists')

const readdir = util.promisify(fs.readdir)

module.exports = async (certDir) => {
  const dirItems = await readdir(certDir).catch(() => [])
  const certPaths = dirItems.map((item) => `${certDir}/${item}/cert.pem`)
  const existsArr = await Promise.all(certPaths.map(fileExists))

  return Promise.all(certPaths
    .filter((certPath, i) => existsArr[i])
    .map(async (certPath) => ({
      ...await getCertInfoFromPath(certPath),
      certPath
    }))
  )
}
