const fs = require('fs')
const util = require('util')
const mkdir = util.promisify(fs.mkdir)
const fileExists = require('./fileExists')

module.exports = async (path) => {
  const dirsArr = path.split('/').filter((item) => item !== '')
  const searchPaths = dirsArr.map((undefined, i, dirs) => (
    `/${[...dirs].splice(0, i + 1).join('/')}`
  ))
  const missingSearchPaths = (await Promise.all(
    searchPaths.map(async (path) => (await fileExists(path)) ? false : path)
  ))
    .filter((path) => (path !== false))

  return missingSearchPaths.reduce(
    (acc, path, i) => acc.then(() => mkdir(path)),
    Promise.resolve()
  )
}
