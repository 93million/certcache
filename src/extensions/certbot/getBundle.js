const path = require('path')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)

module.exports = async (cert) => {
  const dirname = path.dirname(cert.certPath)

  return {
    cert: await readFile(`${dirname}/cert.pem`),
    chain: await readFile(`${dirname}/chain.pem`),
    privkey: await readFile(`${dirname}/privkey.pem`)
  }
}
