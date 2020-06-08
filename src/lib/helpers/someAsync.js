module.exports = (searchArray, callback) => {
  return searchArray.reduce(
    async (acc, cur, idx, src) => {
      return (await acc) || callback(cur, idx, src)
    },
    Promise.resolve(false)
  )
}
