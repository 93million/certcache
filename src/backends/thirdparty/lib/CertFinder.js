const fs = require('fs')
const util = require('util')
const {
  Certificate: X509Certificate,
  PrivateKey,
  RSAPublicKey,
  RSAPrivateKey
} = require('@fidm/x509')
const readdirRecursive = require('./readdirRecursive')
const fileIsCert = require('./fileIsCert')
const fileIsKey = require('./fileIsKey')
const arrayItemsMatch = require('../../../lib/helpers/arrayItemsMatch')

const readFile = util.promisify(fs.readFile)

class CertFinder {
  constructor (certDir) {
    this.certDir = certDir
  }

  async _load () {
    const dirContents = await readdirRecursive(this.certDir)
    const fileIsCertResults = await Promise.all(dirContents.map(fileIsCert))
    const fileIsKeyResults = await Promise.all(dirContents.map(fileIsKey))
    const certs = dirContents.filter((path, i) => fileIsCertResults[i])
    const keys = dirContents.filter((path, i) => fileIsKeyResults[i])
    const pemRegexp = /-----BEGIN[^-]+-----\n[^-]+\n-----END[^-]+-----\n?/g

    this.certList = (await Promise.all(certs.map(
      async (certPath) => {
        const pemList = Array.from(
          (await readFile(certPath)).toString().match(pemRegexp)
        )

        return pemList.map((pem) => {
          const cert = X509Certificate.fromPEM(pem)

          cert.certPath = certPath
          // @todo find a way to use x509 lib to output pem
          cert.pem = pem

          return cert
        })
      }
    )))
      .reduce((acc, keysInFile) => [...acc, ...keysInFile], [])
    this.keyList = await Promise.all(keys.map(
      async (keyPath) => PrivateKey.fromPEM(await readFile(keyPath))
    ))
  }

  async getCert ({ altNames = [], commonName, issuerCommonName }) {
    return (await this.getCerts()).find(({
      subject: { commonName: certCommonName },
      dnsNames = [],
      issuer: { commonName: certIssuerCommonName }
    }) => (
      certCommonName === commonName &&
      arrayItemsMatch(dnsNames, altNames) &&
      (
        issuerCommonName === undefined ||
        certIssuerCommonName === issuerCommonName
      )
    ))
  }

  async getCerts () {
    if (this.certList === undefined) {
      await this._load()
    }

    return this.certList
  }

  async getChain (cert) {
    let issuer = await this.getIssuer(cert)
    const chain = []

    while (issuer !== undefined) {
      chain.push(issuer)

      if (issuer.subject.commonName === issuer.issuer.commonName) {
        break
      }

      issuer = await this.getIssuer(issuer)
    }

    return chain
  }

  async getIssuer (cert) {
    return (await this.getCerts()).find((ca) => {
      return (
        ca.subject.commonName === cert.issuer.commonName &&
        cert.isIssuer(ca)
      )
    })
  }

  async getKey (cert) {
    const certPublicKey = new RSAPublicKey(cert.publicKey.toASN1())

    return (await this.getKeys()).find((key) => {
      const keyPublicKey = new RSAPrivateKey(key.toASN1())

      return (keyPublicKey.modulus === certPublicKey.modulus)
    })
  }

  async getKeys () {
    if (this.keyList === undefined) {
      await this._load()
    }

    return this.keyList
  }
}

module.exports = CertFinder
