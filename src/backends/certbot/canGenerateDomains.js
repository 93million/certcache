const getConfig = require('../../lib/getConfig')
const allItemsPresent = require('../../lib/helpers/allItemsPresent')
const normaliseDomains = require('./lib/normaliseDomains')

module.exports = async (domains) => {
  const config = (await getConfig()).server.backends.certbot

  return allItemsPresent(
    domains,
    normaliseDomains(config.domains).map(({ domain }) => domain)
  )
}
