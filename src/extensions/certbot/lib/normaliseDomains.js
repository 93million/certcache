module.exports = (domains, { defaultChallenge } = {}) => {
  if (typeof domains === 'string') {
    domains = domains.split(',')
  }

  return domains.map((domain) => {
    if (typeof domain === 'string') {
      domain = { domain }
    }

    if (domain.challenges === undefined && defaultChallenge !== undefined) {
      domain.challenges = [defaultChallenge]
    }

    return domain
  })
}
