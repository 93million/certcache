const tar = require('tar')
const fs = require('fs')
const util = require('util')
const { Readable } = require('stream')
const fileExists = require('./fileExists')
const mkdirRecursive = require('./mkdirRecursive')

module.exports = async (certName, data) => {
  const certcacheCertDir = process.env.CERTCACHE_CERT_DIR ||
    __dirname + '/../../certs/'
  const certPath = `${certcacheCertDir}/${certName}`
  const tarStream = new Readable()

  tarStream.push(Buffer.from(data, 'base64'))
  tarStream.push(null)

  if (await fileExists(certPath) === false) {
    await mkdirRecursive(certPath)
  }

  await tarStream.pipe(tar.x({cwd: certPath}))
}
