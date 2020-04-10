const reDefinition = require('../regexps/reDefinition')

module.exports = (items, searchList) => {
  return (
    searchList !== undefined &&
    items.every(
      (item) => {
        return searchList.some((searchItem) => {
          const reSearch = searchItem.match(reDefinition)

          return (reSearch !== null)
            ? new RegExp(reSearch[1]).test(item)
            : searchItem === item
        })
      }
    )
  )
}
