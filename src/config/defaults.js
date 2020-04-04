module.exports = {
  client: {
    certDir: 'certs',
    certs: [],
    host: 'localhost',
    port: 4433,
    renewalDays: 30,
    syncInterval: 60 * 60 * 6
  },
  server: {
    port: 4433
  },
  cahKeysDir: 'cahkeys'
}
