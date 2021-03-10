const getCertInfoFromPem = require('./getCertInfoFromPem')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)

module.exports = async (certPath) => {
  const pem = await readFile(certPath)

  return {
    ...await getCertInfoFromPem(pem),
    certPath
  }
}
