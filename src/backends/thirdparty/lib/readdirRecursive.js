const fs = require('fs')
const util = require('util')
const path = require('path')

const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

module.exports = (dirPath) => {
  const getDirContents = async (dirPath, fileList = []) => {
    const items = await readdir(dirPath)

    await Promise.all(items.map(async (item) => {
      const itemPath = path.resolve(dirPath, item)

      fileList.push(itemPath)

      if ((await stat(itemPath)).isDirectory()) {
        await getDirContents(itemPath, fileList)
      }
    }))

    return fileList
  }

  return getDirContents(dirPath)
}
