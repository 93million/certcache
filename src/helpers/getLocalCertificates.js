const fs = require('fs')
const x509 = require('x509')
const util = require('util')

const readdir = util.promisify(fs.readdir)
const fileExists = require('./fileExists')

module.exports = async (certDir) => {
  const files = await readdir(certDir)
  const certPaths = files.map((file) => `${certDir}${file}`)
  const existsArr = await Promise
    .all(certPaths.map((path) => fileExists(`${path}/cert.pem`)))

  return certPaths
    .filter((undefined, i) => existsArr[i])
    .map((certPath) => ({...x509.parseCert(`${certPath}/cert.pem`), certPath}))
}
