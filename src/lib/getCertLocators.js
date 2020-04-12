const getExtensions = require('./getExtensions')

module.exports = async (domains, letsencryptDomains) => {
  return Object.values(await getExtensions())
}
