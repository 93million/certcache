const arrayItemsMatch = require('../helpers/arrayItemsMatch')

class CertList extends Array {
  findCert (searchCommonName, searchAltNames, extras) {
    return this.find(({altNames, certPath, commonName, issuerCommonName}) => {
      const isTest = (issuerCommonName.indexOf('Fake') !== -1)

      return (
        isTest === extras.isTest &&
        commonName === searchCommonName &&
        arrayItemsMatch(altNames, searchAltNames)
      )
    })
  }
}

module.exports = CertList
