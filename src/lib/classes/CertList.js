const arrayItemsMatch = require('../helpers/arrayItemsMatch')

class CertList extends Array {
  findCert (searchCommonName, searchAltNames, { isTest }) {
    return this.find(({ altNames, commonName, issuerCommonName }) => {
      const certIsTest = issuerCommonName.startsWith('Fake')

      return (
        certIsTest === (isTest === true) &&
        commonName === searchCommonName &&
        arrayItemsMatch(altNames, searchAltNames)
      )
    })
  }
}

module.exports = CertList
