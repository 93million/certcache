/* global test expect */

const normaliseDomains = require('./normaliseDomains')

const mockDomains = [
  { domain: 'test1.example.com' },
  { domain: 'test2.example.com' }
]

test(
  'should accept domains as comma separated strings',
  () => {
    expect(normaliseDomains('test1.example.com,test2.example.com'))
      .toEqual(mockDomains)
  }
)

test(
  'should accept domains as array of strings',
  () => {
    expect(normaliseDomains(['test1.example.com', 'test2.example.com']))
      .toEqual(mockDomains)
  }
)

test(
  'should accept domains as array of objects',
  () => {
    expect(normaliseDomains(mockDomains))
      .toEqual(mockDomains)
  }
)

test(
  'should add default challenge',
  () => {
    expect(normaliseDomains(mockDomains, { defaultChallenge: 'default-01' }))
      .toEqual(expect.arrayContaining([expect.objectContaining({
        challenges: ['default-01']
      })]))
  }
)

test(
  'should not mutate domains object passed in args',
  () => {
    normaliseDomains(mockDomains, { defaultChallenge: 'default-01' })
    expect(mockDomains)
      .not
      .toEqual(expect.arrayContaining([expect.objectContaining({
        challenges: ['default-01']
      })]))
  }
)
