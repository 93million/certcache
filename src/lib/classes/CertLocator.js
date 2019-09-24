
const CertList = require('./CertList')

class CertLocator {
  constructor (handlers) {
    this.handlers = handlers
  }

  async getLocalCerts () {
    return CertList.from(await this.handlers.getLocalCerts())
  }
}

module.exports = CertLocator
