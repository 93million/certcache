const getConfig = require('../../lib/getConfig')
const allItemsPresent = require('../../lib/helpers/allItemsPresent')
const canonicaliseDomains = require('./lib/canonicaliseDomains')

module.exports = async (domains) => {
  const config = (await getConfig()).extensions.certbot

  return allItemsPresent(
    domains,
    canonicaliseDomains(config.domains).map(({ domain }) => domain)
  )
}
