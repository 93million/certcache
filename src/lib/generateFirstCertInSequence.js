const Certificate = require('./classes/Certificate')

module.exports = async (
  certGenerators,
  commonName,
  altNames,
  { isTest },
  config
) => {
  return certGenerators.reduce(
    async (acc, certGenerator) => (
      (await acc) ||
      Certificate.fromPath(
        certGenerator,
        await certGenerator.generateCert(
          commonName,
          altNames,
          { isTest },
          config
        )
      )
    ),
    Promise.resolve()
  )
}
