const getExtensions = require('./getExtensions')

module.exports = (fnName) => async (syncItem) => {
  const extensions = await getExtensions()

  return Object.keys(extensions).reduce(
    async (acc, key) => {
      const extension = extensions[key]
      const meta = extension[fnName] && await extension[fnName](syncItem)

      if (meta !== undefined) {
        (await acc)[key] = meta
      }

      return acc
    },
    Promise.resolve({})
  )
}
