/* global test expect */

const clientPermittedAccessToCerts = require('./clientPermittedAccessToCerts')

const mockClientCertRestrictions = [
  {
    domains: [
      '^(www[1-2]\\.)?example\\.com$',
      '^secure[1-2]\\.93million\\.com$'
    ],
    allow: ['deploy']
  },
  {
    domains: [
      '^test[1-2]\\.example\\.com$',
      '^qa[1-2]\\.93million\\.com$'
    ],
    deny: ['dev']
  },
  {
    domains: ['^dev[1-2]\\.example\\.com$'],
    allow: [
      'deploy',
      'dev'
    ],
    deny: ['qa']
  },
  { domains: ['foo.example.com'] }
]

test(
  'should return true if user is in allow list for all matching domains',
  () => {
    expect(clientPermittedAccessToCerts(
      mockClientCertRestrictions,
      'deploy',
      ['www.example.com', 'dev.example.com']
    ))
      .toBe(true)
  }
)

test(
  'should return false if user is not in allow list for any matching domain',
  () => {
    expect(clientPermittedAccessToCerts(
      mockClientCertRestrictions,
      'qa',
      ['qa1.example.com', 'secure1.93million.com']
    ))
      .toBe(false)
  }
)

test(
  'should return false if user is in deny list for any matching domain',
  () => {
    expect(clientPermittedAccessToCerts(
      mockClientCertRestrictions,
      'dev',
      ['dev1.example.com', 'qa1.93million.com']
    ))
      .toBe(false)
  }
)

test(
  'should return false if is in neither deny or allow list for matching domain',
  () => {
    expect(clientPermittedAccessToCerts(
      mockClientCertRestrictions,
      'dev',
      ['foo.example.com']
    ))
      .toBe(false)
  }
)

test(
  'should return true for non-matching domain',
  () => {
    expect(clientPermittedAccessToCerts(
      mockClientCertRestrictions,
      'dev',
      ['foo1.example.com']
    ))
      .toBe(true)
  }
)
