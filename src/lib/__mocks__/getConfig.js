/* global jest */

const getConfig = jest.fn()

getConfig.mockReturnValue(Promise.resolve({
  cahKeysDir: '/path/to/cahkeys',
  server: {
    backends: {
      certbot: {
        email: 'test@example.com',
        domains: ['~.*\\.example.com$', 'test.93million.com'],
        certbotConfigDir: '/path/to/config/dir',
        certbotLogsDir: '/path/to/logs/dir',
        certbotWorkDir: '/path/to/work/dir',
        certbotExec: 'certbot'
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
    certDir: 'certs',
    certs: [
      { domains: ['test.example.com'], certName: 'filecert1' },
      { domains: ['foo.example.com'], certName: 'filecert2' }
    ],
    backends: {
      certbot: {},
      thirdparty: {}
    }
  }
}))

module.exports = getConfig
