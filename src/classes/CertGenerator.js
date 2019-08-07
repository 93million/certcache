const Certificate = require('../classes/Certificate')

class CertGenerator {
  constructor (handlers) {
    this.handlers = handlers
  }

  async generateCert (commonName, altNames, extras, config) {
    const certPath = await this
      .handlers
      .generateCert(commonName, altNames, extras, config)

    return new Certificate(this.handlers, certPath)
  }
}

module.exports = CertGenerator
