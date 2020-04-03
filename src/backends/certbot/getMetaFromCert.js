module.exports = ({ isserCommonName }) => {
  return { isTest: isserCommonName.startWith('Fake LE ') }
}
