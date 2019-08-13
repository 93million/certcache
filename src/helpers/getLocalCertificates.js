const fs = require('fs')
const getCertInfo = require('./getCertInfo')
const util = require('util')
const fileExists = require('./fileExists')

const readdir = util.promisify(fs.readdir)

module.exports = async (certDir) => {
  const files = await readdir(certDir).catch(() => [])
  const certPaths = files.map((file) => `${certDir}${file}`)
  const existsArr = await Promise
    .all(certPaths.map((path) => fileExists(`${path}/cert.pem`)))

  return certPaths
    .filter((undefined, i) => existsArr[i])
    .map((certPath) => ({...getCertInfo(`${certPath}/cert.pem`), certPath}))
}
