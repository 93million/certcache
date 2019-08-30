const getopts = require('getopts')
const config = require('../../config')
const httpRedirect = require('../httpRedirect')
const obtainCert = require('./obtainCert')

const usage = () => {
  const usage = [
    process.argv[1],
    '-d|--domains <domains> [-t|--test-cert] [-h|--host certcache-host]',
    '[-p|--port certcache-port] [--cert-name certificate-name]'
  ].join(' ')
  console.log(`Usage: ${usage}`)
}

module.exports = async () => {
  const opts = getopts(process.argv.slice(2), {
    alias: { host: 'h', 'test-cert': 't', domains: 'd' },
    default: { 'test-cert': false }
  })
  const host = opts.host || config.certcacheHost
  const port = opts.port || config.certcachePort
  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl

  if (opts.domains === undefined) {
    usage()
  } else {
    const domains = opts.domains.split(',')
    const [commonName, ...altNames] = domains
    const certName = opts['cert-name'] || commonName

    if (httpRedirectUrl !== undefined) {
      httpRedirect.start(httpRedirectUrl)
    }

    obtainCert(
      host,
      port,
      domains[0],
      altNames,
      opts['test-cert'],
      `${config.certcacheCertDir}/${certName}`
    )

    if (httpRedirectUrl !== undefined) {
      httpRedirect.stop()
    }
  }
}
