/* global test expect */

const canonicaliseDomains = require('./canonicaliseDomains')

const mockDomains = [
  { domain: 'test1.example.com' },
  { domain: 'test2.example.com' }
]

test(
  'should accept domains as comma separated strings',
  () => {
    expect(canonicaliseDomains('test1.example.com,test2.example.com'))
      .toEqual(mockDomains)
  }
)

test(
  'should accept domains as array of strings',
  () => {
    expect(canonicaliseDomains(['test1.example.com', 'test2.example.com']))
      .toEqual(mockDomains)
  }
)

test(
  'should accept domains as array of objects',
  () => {
    expect(canonicaliseDomains(mockDomains))
      .toEqual(mockDomains)
  }
)

test(
  'should add default challenge',
  () => {
    expect(canonicaliseDomains(mockDomains, { defaultChallenge: 'default-01' }))
      .toEqual(expect.arrayContaining([expect.objectContaining({
        challenges: ['default-01']
      })]))
  }
)

test(
  'should not mutate domains object passed in args',
  () => {
    canonicaliseDomains(mockDomains, { defaultChallenge: 'default-01' })
    expect(mockDomains)
      .not
      .toEqual(expect.arrayContaining([expect.objectContaining({
        challenges: ['default-01']
      })]))
  }
)
