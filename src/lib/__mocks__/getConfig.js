/* global jest */

const getConfig = jest.fn()

getConfig.mockReturnValue(Promise.resolve({
  cahKeysDir: '/path/to/cahkeys',
  server: {
    backends: {
      certbot: {
        email: 'test@example.com',
        domains: ['/.*\\.example.com$/'],
        certbotLogsDir: '',
        certbotWorkDir: '',
        certbotExec: 'certbot',
        certbotConfigDir: '/path/to/config/dir'
      },
      thirdparty: {
        certDir: '/path/to/cert/dir'
      }
    },
    'client-access': [
      {
        domains: ['/.*\\.example.com/'],
        allow: ['dev', 'client']
      },
      {
        domains: ['test.example.com'],
        deny: ['dev']
      }
    ]
  },
  client: {
    host: 'localhost',
    port: 4433,
    httpRedirectUrl: 'http://certcache.example.com',
    certDir: 'certs'
  }
}))

module.exports = getConfig
