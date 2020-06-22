/* global test expect */

const getChallengeFromDomains = require('./getChallengeFromDomains')
const challenges = require('./challenges')

challenges.mockChallenge1 = 1
challenges.mockChallenge2 = 2
challenges.mockChallenge3 = 3

const mockCertbotDomains = [
  {
    domain: '~test\\d.example.com',
    challenges: ['mockChallenge1', 'mockChallenge3']
  },
  {
    domain: 'example.com',
    challenges: ['mockChallenge2', 'mockChallenge3']
  },
  { domain: 'foo.example.com' }
]

const mockDomains = [
  'example.com',
  'test1.example.com',
  'test2.example.com'
]

test(
  'should return challenge shared between domains',
  async () => {
    await expect(getChallengeFromDomains(
      mockCertbotDomains,
      mockDomains,
      'mockChallenge2'
    ))
      .resolves
      .toBe(challenges.mockChallenge3)
  }
)

test(
  'should use default chalenge when none provided',
  async () => {
    const challenge = await getChallengeFromDomains(
      mockCertbotDomains,
      ['foo.example.com', 'test7.example.com'],
      'mockChallenge1'
    )

    expect(challenge).toBe(challenges.mockChallenge1)
  }
)
