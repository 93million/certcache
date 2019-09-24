const fs = require('fs')
const getCertInfo = require('./getCertInfo')
const util = require('util')
const fileExists = require('./helpers/fileExists')
const CertList = require('./classes/CertList')

const readdir = util.promisify(fs.readdir)

module.exports = async (certDir) => {
  const dirItems = await readdir(certDir).catch(() => [])
  const certPaths = dirItems.map((item) => `${certDir}/${item}/cert.pem`)
  const existsArr = await Promise.all(certPaths.map(fileExists))

  return CertList.from(
    await Promise.all(certPaths
      .filter((certPath, i) => existsArr[i])
      .map(async (certPath) => ({
        ...await getCertInfo(certPath),
        certPath
      }))
    )
  )
}
