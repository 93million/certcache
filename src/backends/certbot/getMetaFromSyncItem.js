module.exports = (syncItem) => {
  return { isTest: (syncItem.testCert === true) }
}
