const packageJson = require('../../../../package.json')
const getExtensions = require('../../getExtensions')

module.exports = async () => {
  const extensions = await getExtensions()

  return {
    extensions: Object.values(extensions).map(({ id }) => id),
    version: packageJson.version
  }
}
