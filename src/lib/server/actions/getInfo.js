const packageJson = require('../../../../package.json')
const getBackends = require('../../getBackends')

module.exports = async () => {
  const backends = await getBackends()

  return {
    backends: Object.values(backends).map(({ id }) => id),
    version: packageJson.version
  }
}
