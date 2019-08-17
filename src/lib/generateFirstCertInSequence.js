module.exports = async (
  certGenerators,
  commonName,
  altNames,
  extras,
  config
) => {
  let certGenerated = false

  return certGenerators.reduce(
    (acc, certGenerator) => {
      return acc.then((cert) => {
        if (certGenerated === false) {
          cert = certGenerator
            .generateCert(commonName, altNames, extras, config)
            .then((certPath) => {
              certGenerated = true

              return certPath
            })
            .catch((e) => { console.error(e) })
        }

        return cert
      })
    },
    Promise.resolve()
  )
}
