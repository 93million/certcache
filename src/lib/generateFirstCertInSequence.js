const Certificate = require('./classes/Certificate')

module.exports = async (certGenerators, commonName, altNames, meta) => {
  return certGenerators.reduce(
    async (acc, certGenerator) => (
      (await acc) ||
      Certificate.fromPath(
        certGenerator,
        await certGenerator.generateCert(
          commonName,
          altNames,
          meta[certGenerator.id] || {}
        )
      )
    ),
    Promise.resolve()
  )
}
