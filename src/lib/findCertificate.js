const arrayItemsMatch = require('./helpers/arrayItemsMatch')

module.exports = (certList, commonName, altNames, isTest) =>
  certList.find(
    ({
      subject: { commonName: certCommonName },
      altNames: certAltNames,
      issuer: { commonName: issuerCommonName }
    }) => {
      const certIsTest = issuerCommonName.startsWith('Fake')

      return (
        certIsTest === isTest &&
        certCommonName === commonName &&
        arrayItemsMatch(certAltNames, altNames)
      )
    }
  )
