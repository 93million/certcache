const sortObjectProperties = require('../helpers/sortObjectProperties')

module.exports = (meta1, meta2) => {
  meta1 = sortObjectProperties(meta1)
  meta2 = sortObjectProperties(meta2)

  return (JSON.stringify(meta1) === JSON.stringify(meta2))
}
