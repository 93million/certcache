const path = require('path')

module.exports = (certPath) => {
  const dirname = path.dirname(certPath)

  return {
    cert: `${dirname}/cert.pem`,
    chain: `${dirname}/chain.pem`,
    key: `${dirname}/privkey.pem`
  }
}
