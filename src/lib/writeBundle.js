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
    extract.on('finish', async () => {
      const writeStream = fs.createWriteStream(`${certDir}/fullchain.pem`)

      writeStream.on('finish', () => {
        const appendStream = fs.createWriteStream(
          `${certDir}/fullchain.pem`,
          { flags: 'a' }
        )

        fs.createReadStream(`${certDir}/chain.pem`).pipe(appendStream)

        appendStream.on('finish', resolve)
      })
      fs.createReadStream(`${certDir}/cert.pem`).pipe(writeStream)
    })
    tarStream.pipe(zlib.createGunzip()).pipe(extract)
  })
}
