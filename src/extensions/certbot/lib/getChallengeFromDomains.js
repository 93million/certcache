const challenges = require('./challenges')
const canonicaliseDomains = require('./canonicaliseDomains')
const allItemsPresent = require('../../../lib/helpers/allItemsPresent')
const getConfig = require('../../../lib/getConfig')

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

module.exports = async (certbotDomains, domains, defaultChallenge) => {
  const config = await getConfig()
  const _challenges = { ...config.extensions.certbot.challenges, ...challenges }
  const challengeTypes = Object.keys(_challenges)
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

  return challengeType && _challenges[challengeType]
}
