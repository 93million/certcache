const path = require('path')
const readFirstLine = require('./readFirstLine')

module.exports = async (filePath) => {
  return (
    ['.pem', '.cer', '.crt'].includes(path.extname(filePath)) &&
    /^-----BEGIN CERTIFICATE-----$/.test(await readFirstLine(filePath))
  )
}
