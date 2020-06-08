const path = require('path')
const getExtensions = require('./getExtensions')
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
  const extensions = await getExtensions()
  const config = await getConfig()
  const locators = Object.keys(extensions)
  const filteredLocators = (opts.extensions === undefined)
    ? locators
    : locators
      .filter((extension) => opts.extensions.split(',').includes(extension))
  const localCerts = await Promise.all(
    filteredLocators.map((locator) => extensions[locator].getLocalCerts())
  )
  const clientCerts = await getLocalCertificates(path.resolve(config.certDir))
  const div = '======================'

  filteredLocators.forEach((locator, i) => {
    console.log(`${div}\nExtension: ${locator}\n${div}`)
    localCerts[i].forEach((cert) => {
      outputCertInfo(cert)
    })
    console.log('\n')
  })

  console.log(`${div}\nClient certs\n${div}`)
  clientCerts.forEach((cert) => {
    outputCertInfo(cert)
  })
}
