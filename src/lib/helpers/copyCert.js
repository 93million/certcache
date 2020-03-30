const fs = require('fs')
const util = require('util')
const path = require('path')
const fileExists = require('./fileExists')

const mkdir = util.promisify(fs.mkdir)
const readdir = util.promisify(fs.readdir)
const copyFile = util.promisify(fs.copyFile)

module.exports = async (fromDir, toDir) => {
  if (await fileExists(toDir) === false) {
    await mkdir(toDir)
  }

  const files = await readdir(fromDir)

  return Promise.all(files.map((file) => {
    return copyFile(path.resolve(fromDir, file), path.resolve(toDir, file))
  }))
}
