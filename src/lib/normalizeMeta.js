const getExtensions = require('./getExtensions')

module.exports = async (meta) => {
  const extensions = await getExtensions()

  return Object.values(extensions).reduce(async (acc, extension) => {
    acc = await acc

    if (extension.normalizeMeta !== undefined) {
      acc[extension.id] = await extension.normalizeMeta(acc[extension.id] || {})
    }

    return acc
  }, { ...meta })
}
