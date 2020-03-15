/* global jest */

const getDomainsFromConfig = jest.fn()

getDomainsFromConfig.mockReturnValue([
  {
    certName: 'mail',
    domains: ['mail.mcelderry.com'],
    is_test: true
  },
  {
    certName: 'web',
    domains: [
      'mcelderry.com',
      'gitlab.mcelderry.com',
      'switchd.mcelderry.com',
      'webmail.mcelderry.com',
      'www.mcelderry.com',
      'foo.boo.coo'
    ]
  }
])

module.exports = getDomainsFromConfig
