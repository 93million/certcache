const fs = require('fs')
const util = require('util')
const locateKeysDir = require('./locateKeysDir')

const readdir = util.promisify(fs.readdir)

module.exports = async (cahKey) => {
  const keyDir = process.env.CAH_KEY_DIR || await locateKeysDir()

  if (cahKey !== undefined) {
    return `${keyDir}/${cahKey}.cahkey`
  } else if (process.env.CAH_KEY_NAME !== undefined) {
    return `${keyDir}/${process.env.CAH_KEY_NAME}.cahkey`
  } else {
    const files = await readdir(keyDir)
    const keys = files.filter(filename => {
      const excludeDirKeys = ['server']
      const [ext, basename] = filename.split('.').reverse()

      return (ext === 'cahkey' && excludeDirKeys.indexOf(basename) === -1)
    })

    if (keys.length !== 1) {
      throw new Error('Too many client keys! Specify one in env CAH_KEY_NAME')
    } else {
      return `${keyDir}/${keys[0]}`
    }
  }
}
