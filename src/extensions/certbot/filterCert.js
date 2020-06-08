module.exports = ({ meta: { isTest } }) => ({ issuerCommonName }) => {
  return (issuerCommonName.startsWith('Fake LE ') === (isTest === true))
}
