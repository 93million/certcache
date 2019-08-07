const getopts = require("getopts")
const requestCert = require('../helpers/requestCert')
const writeBundle = require('../helpers/writeBundle')
const config = require('../config')
const httpRedirect = require('../helpers/httpRedirect')
const debug = require('debug')('certcache:getCert')

const opts = getopts(process.argv.slice(2), {
  alias: {host: 'h', 'test-cert': 't', domains: 'd'},
  default: {'test-cert': false}
})

const usage = () => {
  const usage = [
    process.argv[1],
    '-d|--domains <domains> [-t|--test-cert] [-h|--host certcache-host]',
    '[-p|--port certcache-port] [--cert-name certificate-name]'
  ].join (' ')
  console.log(`Usage: ${usage}`)
}

const getCert = async () => {
  const host = opts.host || config.certcacheHost
  const port = opts.port || config.certcachePort
  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl

  if (opts.domains === undefined) {
    usage()
  } else {
    const domains = opts.domains.split(',')
    const certName = opts['cert-name'] || domains[0]

    if (httpRedirectUrl !== undefined) {
      httpRedirect.start(httpRedirectUrl)
    }

    const response = await requestCert(
      {host, port},
      opts.domains.split(','),
      opts['test-cert']
    )

    if (httpRedirectUrl !== undefined) {
      httpRedirect.stop()
    }

    const responseObj = JSON.parse(response)

    if (responseObj.success === true) {
      writeBundle(certName, responseObj.data.bundle)
    } else {
      let message = `Error obtaining certificate ${certName}`

      debug(`Error obtaining bundle`, responseObj)

      if (responseObj.error !== undefined) {
        message += `. Error: '${responseObj.error}'`
      }

      console.error(message)
    }
  }
}

getCert().catch((e) => {console.error('ERROR!', e)})
