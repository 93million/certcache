const tar = require('tar-stream')
const zlib = require('zlib')
const { Readable } = require('stream')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')
const fs = require('fs')

module.exports = async (certDir, data) => {
  const tarStream = new Readable()
  const extract = tar.extract()

  tarStream.push(Buffer.from(data, 'base64'))
  tarStream.push(null)

  if (await fileExists(certDir) === false) {
    await mkdirRecursive(certDir)
  }

  extract.on('entry', ({ name }, stream, next) => {
    stream.pipe(fs.createWriteStream(`${certDir}/${name}`))
    stream.on('end', next)
    stream.resume()
  })

  return new Promise((resolve, reject) => {
    extract.on('error', reject)
    extract.on('finish', resolve)
    tarStream.pipe(zlib.createGunzip()).pipe(extract)
  })
}
