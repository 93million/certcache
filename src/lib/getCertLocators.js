const getBackends = require('./getBackends')

module.exports = async (domains, letsencryptDomains) => {
  return Object.values(await getBackends())
}
