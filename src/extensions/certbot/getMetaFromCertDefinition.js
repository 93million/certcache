module.exports = ({ testCert }) => {
  return { isTest: (testCert === true) }
}
