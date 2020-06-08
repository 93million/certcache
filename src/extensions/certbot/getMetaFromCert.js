module.exports = ({ issuerCommonName }) => {
  return { isTest: issuerCommonName.startsWith('Fake LE ') }
}
