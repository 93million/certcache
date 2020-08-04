module.exports = {
  binDir: 'bin',
  cahKeysDir: 'cahkeys',
  certDir: 'certs',
  certs: [],
  httpRequestInterval: 1,
  maxRequestTime: 90,
  renewalDays: 30,
  server: { port: 4433 },
  syncInterval: 60 * 6,
  upstream: '--internal'
}
