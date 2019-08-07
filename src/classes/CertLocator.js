const Certificate = require('./Certificate')
const CertList = require('./CertList')

class CertLocator {
  constructor (handlers) {
    this.handlers = handlers
  }

  async getLocalCerts () {
    return CertList.from(
      (await this.handlers.getLocalCertPaths())
        .map((certPath) => new Certificate(this.handlers, certPath))
    )
  }
}

module.exports = CertLocator
