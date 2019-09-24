const CertFinder = require('./lib/CertFinder')
const config = require('../../config')

module.exports = async ({ commonName, altNames, issuerCommonName }) => {
  const certFinder = new CertFinder(config.thirdpartyDir)
  const cert = await certFinder
    .getCert({ commonName, altNames, issuerCommonName })
  const privkey = await certFinder.getKey(cert)
  const chain = (await certFinder.getChain(cert))
    .map(({ pem }) => pem).join('')

  return {
    cert: cert.pem,
    chain,
    privkey: privkey.toPEM()
  }
}
