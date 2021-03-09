module.exports = ({ issuerCommonName }) => {
  return {
    isTest: (
      issuerCommonName.startsWith('Fake LE ') ||
      issuerCommonName.startsWith('(STAGING)')
    )
  }
}
