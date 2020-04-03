const getBackends = require('./getBackends')

module.exports = (fnName) => async (syncItem) => {
  const backends = await getBackends()

  return Object.keys(backends).reduce(
    (acc, key) => {
      const backend = backends[key]
      const meta = backend[fnName] && backend[fnName](syncItem)

      if (meta !== undefined) {
        acc[key] = meta
      }

      return acc
    },
    {}
  )
}
