const reDefinition = require('./regexps/reDefinition')

module.exports = (clientCertRestrictions, clientName, domains) => (
  domains.every(
    (certDomain) => {
      const matchedDomainResults = clientCertRestrictions
        .filter(({ domains }) => {
          return domains.some((domain) => {
            const reDomainMatch = domain.match(reDefinition)

            return (reDomainMatch !== null)
              ? new RegExp(reDomainMatch[1]).test(certDomain)
              : (domain === certDomain)
          })
        })
        .map(({ allow = [], deny = [] }) => (
          allow.includes(clientName) === true &&
          deny.includes(clientName) === false
        ))

      return (
        matchedDomainResults.length !== 0 &&
        matchedDomainResults.every((match) => (match === true))
      )
    }
  )
)
