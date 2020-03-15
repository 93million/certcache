const getConfig = require('../../lib/getConfig')
const reDomain = require('../../lib/regexps/reDomain')

module.exports = async (domains) => {
  const config = (await getConfig()).server.backends.certbot

  return (
    config.domains !== undefined &&
    domains.every(
      (domain) => {
        return config.domains.some((certbotDomain) => {
          return (reDomain.test(certbotDomain))
            ? new RegExp(certbotDomain.replace(reDomain, '$1')).test(domain)
            : certbotDomain === domain
        })
      }
    )
  )
}
