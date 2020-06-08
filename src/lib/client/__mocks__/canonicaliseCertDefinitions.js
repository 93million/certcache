/* global jest */

const canonicaliseCertDefinitions = jest.fn()

canonicaliseCertDefinitions.mockReturnValue([
  {
    certName: 'mail',
    domains: ['mail.example.com'],
    isTest: true
  },
  {
    certName: 'web',
    domains: [
      'example.com',
      'bar.example.com',
      'foo.example.com',
      'test.example.com',
      'www.example.com'
    ]
  }
])

module.exports = canonicaliseCertDefinitions
