const getExtensions = require('./getExtensions')

module.exports = (fnName) => async (syncItem) => {
  const extensions = await getExtensions()

  return Object.keys(extensions).reduce(
    (acc, key) => {
      const extension = extensions[key]
      const meta = extension[fnName] && extension[fnName](syncItem)

      if (meta !== undefined) {
        acc[key] = meta
      }

      return acc
    },
    {}
  )
}
