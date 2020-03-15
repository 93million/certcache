const getBackends = require('./getBackends')

module.exports = async (domains) => {
  return Object.values(await getBackends()).reduce(
    async (acc, backend) => (
      backend.canGenerateDomains !== undefined &&
      await backend.canGenerateDomains(domains)
    )
      ? [...(await acc), backend]
      : acc,
    Promise.resolve([])
  )
}
