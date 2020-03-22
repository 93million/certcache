module.exports = {
  client: {
    host: 'localhost',
    port: 4433,
    certDir: 'certs',
    syncInterval: 60 * 60 * 6,
    renewalDays: 30
  },
  server: {
    port: 4433
  },
  cahKeysDir: 'cahkeys'
}
