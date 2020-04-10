const reDefinition = require('./regexps/reDefinition')

module.exports = (clientCertRestrictions, clientName, domains) => (
  domains.reduce(
    (acc, certDomain) => (
      acc &&
      clientCertRestrictions.reduce(
        (acc, { domains, allow = [], deny = [] }) => (
          acc &&
          domains.reduce(
            (acc, domain) => {
              const reDomainMatch = domain.match(reDefinition)
              const domainMatch = (reDomainMatch !== null)
                ? new RegExp(reDomainMatch[1]).test(certDomain)
                : (domain === certDomain)
              return (
                acc &&
                (
                  domainMatch === false ||
                  (allow.includes(clientName) && !deny.includes(clientName))
                )
              )
            },
            true
          )
        ),
        true
      )
    ),
    true
  )
)
