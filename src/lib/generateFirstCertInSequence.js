const Certificate = require('./classes/Certificate')

module.exports = async (
  certGenerators,
  commonName,
  altNames,
  { isTest }
) => {
  return certGenerators.reduce(
    async (acc, certGenerator) => (
      (await acc) ||
      Certificate.fromPath(
        certGenerator,
        await certGenerator.generateCert(
          commonName,
          altNames,
          { isTest }
        )
      )
    ),
    Promise.resolve()
  )
}
