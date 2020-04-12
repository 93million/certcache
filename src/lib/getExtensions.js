const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const extensionsDir = path.resolve(__dirname, '..', 'extensions')

let extensions

module.exports = async () => {
  if (extensions === undefined) {
    extensions = (await readdir(extensionsDir)).reduce(
      async (acc, filename) => {
        if ((await stat(path.resolve(extensionsDir, filename))).isDirectory()) {
          const extension = require(path.resolve(extensionsDir, filename));

          (await acc)[filename] = { ...extension, id: filename }
        }

        return acc
      },
      Promise.resolve({})
    )
  }

  return extensions
}
