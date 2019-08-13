const fileExists = require('./fileExists')
const path = require('path')

module.exports = async () => {
  const parentDirs = path.dirname(__filename).split('/')
  const searchPaths = parentDirs.map((dir, i, dirs) => (
    `${[...dirs].splice(0, dirs.length - i).join('/')}/cahkeys`
  )).slice(0, parentDirs.length - 1)
  const searchPathResults = await Promise.all(searchPaths.map(fileExists))

  return searchPaths.find((path, i) => (searchPathResults[i] === true))
}
