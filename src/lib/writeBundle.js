const tar = require('tar-stream')
const zlib = require('zlib')
const { Readable } = require('stream')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')
const fs = require('fs')
const path = require('path')
const setAndDemandDirPerms = require('./helpers/setAndDemandDirPerms')
const util = require('util')
const getConfig = require('./getConfig')

const chmod = util.promisify(fs.chmod)

module.exports = async (certDir, data) => {
  const tarStream = new Readable()
  const extract = tar.extract()
  const parentDir = path.dirname(certDir)
  const { skipFilePerms } = await getConfig()

  tarStream.push(Buffer.from(data, 'base64'))
  tarStream.push(null)

  if (await fileExists(certDir) === false) {
    await mkdirRecursive(certDir)
  }

  if (skipFilePerms !== true) {
    await setAndDemandDirPerms(parentDir)
  }

  extract.on('entry', ({ name }, stream, next) => {
    stream.pipe(fs.createWriteStream(`${certDir}/${name}`))
    stream.on('end', next)
    stream.resume()
  })

  return new Promise((resolve, reject) => {
    extract.on('error', reject)
    extract.on('finish', async () => {
      const writeStream = fs
        .createWriteStream(path.resolve(certDir, 'fullchain.pem'))

      writeStream.on('finish', () => {
        const appendStream = fs.createWriteStream(
          path.resolve(certDir, 'fullchain.pem'),
          { flags: 'a' }
        )

        fs
          .createReadStream(path.resolve(certDir, 'chain.pem'))
          .pipe(appendStream)

        appendStream.on('finish', async () => {
          if (skipFilePerms !== true) {
            await chmod(path.resolve(certDir, 'privkey.pem'), 0o600)
          }

          resolve()
        })
      })
      fs.createReadStream(path.resolve(certDir, 'cert.pem')).pipe(writeStream)
    })
    tarStream.pipe(zlib.createGunzip()).pipe(extract)
  })
}
