const challenges = require('./challenges')
const canonicaliseDomains = require('./canonicaliseDomains')
const allItemsPresent = require('../../../lib/helpers/allItemsPresent')

const groupCertbotDomainsByChallengeType = (certbotDomains, challengeTypes) => {
  return challengeTypes.reduce(
    (acc, challengeType) => {
      return {
        ...acc,
        [challengeType]: certbotDomains.reduce(
          (acc, { domain, challenges }) => {
            if (challenges.includes(challengeType) === true) {
              acc.push(domain)
            }
            return acc
          },
          []
        )
      }
    },
    {}
  )
}

module.exports = (certbotDomains, domains, defaultChallenge) => {
  const challengeTypes = Object.keys(challenges)
  const certbotDomainsByChallengeTypes = groupCertbotDomainsByChallengeType(
    canonicaliseDomains(certbotDomains, { defaultChallenge }),
    challengeTypes
  )
  const challengeType = challengeTypes.find((challengeType) => {
    return allItemsPresent(
      domains,
      certbotDomainsByChallengeTypes[challengeType]
    )
  })

  return challengeType && challenges[challengeType]
}
