const CertFinder = require('./lib/CertFinder')
const getConfig = require('../../lib/getConfig')

module.exports = async ({ commonName, altNames, issuerCommonName }) => {
  const config = (await getConfig()).server.backends.thirdparty
  const certFinder = new CertFinder(config.certDir)
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
