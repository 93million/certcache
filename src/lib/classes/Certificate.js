const tar = require('tar')
const getCertInfo = require('../getCertInfo')
const fs = require('fs')
const util = require('util')
const rimraf = require('rimraf')
const path = require('path')
const os = require('os')
const debug = require('debug')('certcache:certificate')

const mkdtemp = util.promisify(fs.mkdtemp)
const copyFile = util.promisify(fs.copyFile)
const appendFile = util.promisify(fs.appendFile)
const readFile = util.promisify(fs.readFile)
const rmdir = util.promisify(rimraf)

class Certificate {
  constructor (handlers, certPath) {
    this.handlers = handlers
    const certInfo = getCertInfo(certPath)

    for (const i in certInfo) {
      this[i] = certInfo[i]
    }
  }

  async getArchive () {
    const tmpDir = await mkdtemp(
      path.join(os.tmpdir(), 'com.93million.certcache.')
    )
    debug(`created temp dir ${tmpDir}`)
    const bundleFiles = this.handlers.getFilesForBundle(this.certPath)
    const tmpCertPath = `${tmpDir}/cert.pem`
    const tmpChainPath = `${tmpDir}/chain.pem`
    const tmpKeyPath = `${tmpDir}/privkey.pem`
    const tmpFullchainPath = `${tmpDir}/fullchain.pem`

    await Promise.all([
      copyFile(bundleFiles.cert, tmpCertPath),
      copyFile(bundleFiles.chain, tmpChainPath),
      copyFile(bundleFiles.privkey, tmpKeyPath),
      copyFile(bundleFiles.cert, tmpFullchainPath)
        .then(() => readFile(bundleFiles.chain))
        .then((chainBuffer) => appendFile(tmpFullchainPath, chainBuffer))
    ])

    const tarStream = await tar.c(
      { gzip: true, cwd: tmpDir },
      ['cert.pem', 'chain.pem', 'privkey.pem', 'fullchain.pem']
    )

    await rmdir(tmpDir)

    return new Promise((resolve) => {
      const chunks = []

      tarStream.on('data', (chunk) => {
        chunks.push(chunk)
      })

      tarStream.on('end', () => {
        debug(`created certificate archive from tar file`)
        resolve(Buffer.concat(chunks))
      })
    })
  }
}

module.exports = Certificate
