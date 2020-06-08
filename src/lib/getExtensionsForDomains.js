const getExtensions = require('./getExtensions')

module.exports = async (domains) => {
  return Object.values(await getExtensions()).reduce(
    async (acc, extension) => (
      extension.canGenerateDomains === undefined ||
      await extension.canGenerateDomains(domains)
    )
      ? [...(await acc), extension]
      : acc,
    Promise.resolve([])
  )
}
