/* global jest */

const getConfig = jest.fn()

getConfig.mockReturnValue(Promise.resolve({
  cahKeysDir: '/path/to/cahkeys',
  server: {
    extensions: {
      certbot: {
        certbotConfigDir: '/path/to/config/dir',
        certbotExec: 'certbot',
        certbotLogsDir: '/path/to/logs/dir',
        certbotWorkDir: '/path/to/work/dir',
        defaultChallenge: 'http-01',
        domains: [
          {
            domain: '~.*\\.example.com$',
            challenges: ['dns-01', 'http-01']
          },
          'test.93million.com'
        ],
        email: 'test@example.com'
      },
      thirdparty: {
        certDir: '/path/to/cert/dir'
      }
    },
    clientRestrictions: [
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
    certDir: 'certs',
    certs: [
      { domains: ['test.example.com'], certName: 'filecert1' },
      { domains: ['foo.example.com'], certName: 'filecert2' }
    ],
    extensions: {
      certbot: {},
      thirdparty: {}
    },
    renewalDays: 30,
    syncInterval: 60 * 60 * 6
  }
}))

module.exports = getConfig
