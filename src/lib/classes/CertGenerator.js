const Certificate = require('./Certificate')

class CertGenerator {
  constructor (handlers) {
    this.handlers = handlers
  }

  async generateCert (commonName, altNames, { isTest }, config) {
    const certPath = await this
      .handlers
      .generateCert(commonName, altNames, { isTest }, config)

    return Certificate.fromPath(this.handlers, certPath)
  }
}

module.exports = CertGenerator
