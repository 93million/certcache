const sortObjectProperties = (obj) => {
  return Array.isArray(obj)
    ? [...obj].sort().map((item) => sortObjectProperties(item))
    : (typeof obj === 'object')
      ? (Object.keys(obj)).sort().reduce(
        (acc, key) => {
          acc[key] = sortObjectProperties(obj[key])

          return acc
        },
        {}
      )
      : obj
}

module.exports = sortObjectProperties
