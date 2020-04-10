module.exports = {
  certonlyArgs: [
    '--preferred-challenges',
    'dns',
    '--authenticator',
    'certbot-dns-standalone:dns-standalone'
  ]
}
