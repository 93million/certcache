const path = require('path')
const getBackends = require('./getBackends')
const getLocalCertificates = require('./getLocalCertificates')
const getConfig = require('./getConfig')

const outputCertInfo = ({
  altNames,
  certPath,
  commonName,
  issuerCommonName,
  notAfter,
  notBefore
}) => {
  console.log(`Path:         ${certPath}`)
  console.log(`Common name:  ${commonName}`)
  console.log(`Alt names:    ${altNames.join(',')}`)
  console.log(`Issuer:       ${issuerCommonName}`)
  console.log(`Start date:   ${notBefore}`)
  console.log(`End date:     ${notAfter}`)
  console.log('')
}

module.exports = async (opts) => {
  const backends = await getBackends()
  const config = await getConfig()
  const locators = Object.keys(backends)
  const filteredLocators = (opts.backends === undefined)
    ? locators
    : locators.filter((backend) => opts.backends.split(',').includes(backend))
  const localCerts = await Promise.all(
    filteredLocators.map((locator) => backends[locator].getLocalCerts())
  )
  const clientCerts = await getLocalCertificates(path.resolve(config.client.certDir))

  filteredLocators.forEach((locator, i) => {
    console.log(`===================\nBackend: ${locator}\n===================`)
    localCerts[i].forEach((cert) => {
      outputCertInfo(cert)
    })
    console.log('\n')
  })

  console.log(`===================\nClient certs\n===================`)
  clientCerts.forEach((cert) => {
    outputCertInfo(cert)
  })
}
