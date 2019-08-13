const tar = require('tar')
const fs = require('fs')
const util = require('util')
const { Readable } = require('stream')
const fileExists = require('./helpers/fileExists')
const mkdirRecursive = require('./helpers/mkdirRecursive')

module.exports = async (certPath, data) => {
  const tarStream = new Readable()

  tarStream.push(Buffer.from(data, 'base64'))
  tarStream.push(null)

  if (await fileExists(certPath) === false) {
    await mkdirRecursive(certPath)
  }

  await tarStream.pipe(tar.x({cwd: certPath}))
}
