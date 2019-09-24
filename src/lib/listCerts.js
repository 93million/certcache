const locators = require('../config/locators')
const CertLocator = require('../lib/classes/CertLocator')
const backends = require('../backends')
const getLocalCertificates = require('./getLocalCertificates')
const config = require('../config')

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
  const filteredLocators = (opts.backends === undefined)
    ? locators
    : locators.filter((backend) => opts.backends.split(',').includes(backend))
  const certLocators = filteredLocators
    .map((locator) => new CertLocator(backends[locator]))
  const localCerts = await Promise.all(
    certLocators.map(async (certLocator) => certLocator.getLocalCerts())
  )
  const clientCerts = await getLocalCertificates(config.certcacheCertDir)

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
