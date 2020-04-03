module.exports = ({ isTest }) => ({ issuerCommonName }) => {
  return (
    issuerCommonName.startsWith('Fake LE ') === (isTest === true)
  )
}
