const tar = require('tar')
const { Readable } = require('stream')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')

module.exports = async (certDir, data) => {
  const tarStream = new Readable()

  tarStream.push(Buffer.from(data, 'base64'))
  tarStream.push(null)

  if (await fileExists(certDir) === false) {
    await mkdirRecursive(certDir)
  }

  await tarStream.pipe(tar.x({ cwd: certDir }))
}
