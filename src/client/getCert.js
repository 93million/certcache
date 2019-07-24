const getopts = require("getopts")
const requestCert = require('../helpers/requestCert')
const writeBundle = require('../helpers/writeBundle')

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
  const host = opts.host || process.env.CERTCACHE_HOST || 'localhost'
  const port = opts.port || process.env.CERTCACHE_PORT || 4433

  if (opts.domains === undefined) {
    usage()
  } else {
    const domains = opts.domains.split(',')
    const certName = opts['cert-name'] || domains[0]
    const response = await requestCert(
      {host, port},
      opts.domains.split(','),
      opts['test-cert']
    )
    const responseObj = JSON.parse(response)

    if (responseObj.success === true) {
      writeBundle(certName, responseObj.data.bundle)
      console.log(`Created certificate bundle at ${certName}`)
    } else {
      console.error(`Error obtaining certificate ${certName}`)
    }
  }
}

getCert().catch((e) => {console.error('ERROR!', e)})
