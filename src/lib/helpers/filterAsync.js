module.exports = async (searchArray, callback) => {
  const filterResults = await Promise.all(
    searchArray.map(callback)
  )

  return searchArray.filter((_, i) => filterResults[i])
}
