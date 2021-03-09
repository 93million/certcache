module.exports = ({ meta: { isTest } }) => ({ issuerCommonName }) => {
  const isTestCert = (
    issuerCommonName.startsWith('Fake LE ') ||
    issuerCommonName.startsWith('(STAGING)')
  )

  return (isTestCert === (isTest === true))
}
