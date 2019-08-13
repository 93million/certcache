const getopts = require("getopts")
const requestCert = require('../requestCert')
const getLocalCertificates = require('../getLocalCertificates')
const config = require('../../config')
const httpRedirect = require('../httpRedirect')
const path = require('path')
const writeBundle = require('../writeBundle')
const debug = require('debug')('certcache:getCert')

module.exports = async () => {
  const opts = getopts(process.argv.slice(2), {
    alias: {host: 'h', test: 't', daemon: 'D'},
    default: {test: false, days: 30, daemon: false}
  })
  const certcacheCertDir = config.certcacheCertDir
  const certs = await getLocalCertificates(certcacheCertDir)
  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + opts.days)

  const certsForRenewal = certs
    .filter(({notAfter}) => (notAfter.getTime() < certRenewEpoch.getTime()))
  const host = opts.host || config.certcacheHost
  const port = opts.port || config.certcachePort
  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  await Promise.all(certsForRenewal.map(async ({
    commonName,
    altNames,
    issuerCommonName,
    certPath
  }) => {
    const isTest = (issuerCommonName.indexOf('Fake') !== -1)

    altNames.splice(altNames.indexOf(commonName), 1)

    console.log([
      `Renewing certificate CN=${commonName}`,
      `SAN=${JSON.stringify(altNames)}`,
      isTest ? 'test' : 'live'
    ].join(' '))

    const response = await requestCert(
      {host, port},
      [commonName, ...altNames],
      isTest
    )

    const responseObj = JSON.parse(response)

    if (responseObj.success === true) {
      await writeBundle(path.dirname(certPath), responseObj.data.bundle)
    } else {
      let message = `Error obtaining certificate ${certPath}`

      debug(`Error obtaining bundle`, responseObj)

      if (responseObj.error !== undefined) {
        message += `. Error: '${responseObj.error}'`
      }

      console.error(message)
    }
  }))

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }

  console.log(`${certsForRenewal.length} of ${certs.length} certs synced`)
}
