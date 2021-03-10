const tls = require('tls')
const net = require('net')

module.exports = (cert) => {
  const secureContext = tls.createSecureContext({ cert })
  const secureSocket = new tls.TLSSocket(new net.Socket(), { secureContext })

  return secureSocket.getCertificate()
}
