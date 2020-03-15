const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const backendsDir = path.resolve(__dirname, '..', 'backends')

let backends

module.exports = async () => {
  if (backends === undefined) {
    backends = (await readdir(backendsDir)).reduce(
      async (acc, filename) => {
        if ((await stat(path.resolve(backendsDir, filename))).isDirectory()) {
          (await acc)[filename] = require(path.resolve(backendsDir, filename))
        }

        return acc
      },
      Promise.resolve({})
    )
  }

  return backends
}
