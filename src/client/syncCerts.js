const getopts = require("getopts")
const requestCert = require('../helpers/requestCert')
const getLocalCertificates = require('../helpers/getLocalCertificates')

const opts = getopts(process.argv.slice(2), {
  alias: {host: 'h', test: 't', daemon: 'D'},
  default: {test: false, days: 30, daemon: false}
})

const syncCerts = async () => {
  const certcacheCertDir = process.env.CERTCACHE_CERT_DIR ||
    __dirname + '/../../certs/'
  const certs = await getLocalCertificates(certcacheCertDir)
  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + opts.days)

  const certsForRenewal = certs
    .filter(({notAfter}) => (notAfter.getTime() < certRenewEpoch.getTime()))
  const host = opts.host || process.env.CERTCACHE_HOST || 'localhost'
  const port = opts.port || process.env.CERTCACHE_PORT || 4433

  await Promise.all(certsForRenewal.map(({
    subject: {commonName},
    altNames,
    issuer: {commonName: issuerCommonName}
  }) => {
    const isTest = (issuerCommonName.indexOf('Fake') !== -1)

    altNames.splice(altNames.indexOf(commonName), 1)

    console.log(`Renewing certificate CN=${commonName} SAN=${JSON.stringify(altNames)} ${isTest ? 'test' : 'live'}`)

    return requestCert({host, port}, [commonName, ...altNames], isTest)
  }))

  console.log('Done')
}

syncCerts().catch((e) => {console.error(`ERROR! ${e}`)})
