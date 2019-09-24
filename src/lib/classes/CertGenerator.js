const Certificate = require('./Certificate')

class CertGenerator {
  constructor (handlers) {
    this.handlers = handlers
  }

  async generateCert (commonName, altNames, extras, config) {
    const certPath = await this
      .handlers
      .generateCert(commonName, altNames, extras, config)

    return Certificate.fromPath(this.handlers, certPath)
  }
}

module.exports = CertGenerator
