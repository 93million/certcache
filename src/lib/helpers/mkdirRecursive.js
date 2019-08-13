const fs = require('fs')
const util = require('util')
const mkdir = util.promisify(fs.mkdir)
const fileExists = require('./fileExists')

module.exports = async (path) => {
  const dirsArr = path.split('/').filter((item) => (item !== ''))
  const searchPaths = dirsArr.map((path, i, dirs) => (
    `/${[...dirs].splice(0, i + 1).join('/')}`
  ))

  return searchPaths.reduce(
    async (acc, path) => (
      (await fileExists(path) === false)
        ? acc.then(() => mkdir(path))
        : acc
    ),
    Promise.resolve()
  )
}
