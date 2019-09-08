module.exports = (clientCertRestrictions, commonName, domains) => (
  domains.reduce(
    (acc, certDomain) => (
      acc &&
      clientCertRestrictions.reduce(
        (acc, { domains, allow = [], deny = [] }) => (
          acc &&
          domains.reduce(
            (acc, domain) => (
              acc &&
              (
                !new RegExp(domain).test(certDomain) ||
                (allow.includes(commonName) && !deny.includes(commonName))
              )
            ),
            true
          )
        ),
        true
      )
    ),
    true
  )
)
