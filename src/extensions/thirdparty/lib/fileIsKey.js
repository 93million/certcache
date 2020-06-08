const path = require('path')
const readFirstLine = require('./readFirstLine')

module.exports = async (filePath) => {
  return (
    ['.pem', '.key'].includes(path.extname(filePath)) &&
    /-BEGIN( RSA)? PRIVATE KEY-/.test(await readFirstLine(filePath))
  )
}
