const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const fileExists = require('../../fileExists')
const path = require('path')

module.exports = async () => {
  const certDir = path.resolve(__dirname, '..', '..', '..', '..', 'certbot', 'config', 'live')
  const files = await readdir(certDir).catch(() => [])
  const certPaths = files.map((file) => `${certDir}/${file}/cert.pem`)
  const existsArr = await Promise.all(certPaths.map(fileExists))

  return certPaths.filter((undefined, i) => existsArr[i])
}
