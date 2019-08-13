const arrayItemsMatch = require('./helpers/arrayItemsMatch')

module.exports = (certList, commonName, altNames, isTest) =>
  certList.find(
    ({
      subject: { commonName: certCommonName },
      altNames: certAltNames,
      issuer: { commonName: issuerCommonName }
    }) => {
      const certIsTest = (issuerCommonName.indexOf('Fake') !== -1)

      return (
        certIsTest === isTest &&
      certCommonName === commonName &&
      arrayItemsMatch(certAltNames, altNames)
      )
    }
  )
