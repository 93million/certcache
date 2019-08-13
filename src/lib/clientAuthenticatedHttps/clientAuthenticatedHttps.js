const https = require('https')
const loadKey = require('./lib/loadKey')
const getCAHKeyPath = require('./lib/getCAHKeyPath')

const clientAuthenticatedHttps = {
  ...https,
  async createServer (a1, a2) {
    const keyPath = await getCAHKeyPath('server')
    const keyOptions = await loadKey(keyPath)

    const options = { ...keyOptions, requestCert: true, rejectUnauthorized: true }

    return https.createServer(
      (typeof a1 === 'object') ? { ...a1, ...options } : options,
      (typeof a1 === 'function') ? a1 : a2
    )
  },
  get (a1, a2, a3) {
    return this.request(a1, a2, a3, { method: 'GET' })
  },
  async request (a1, a2, a3, optionOverrides = {}) {
    const { cahKey, ...receivedOptions } = (typeof a1 === 'object')
      ? a1
      : (typeof a2 === 'object') ? a2 : {}
    const callback = (typeof a2 === 'function') ? a2 : a3

    const keyPath = await getCAHKeyPath(cahKey)
    const keyOptions = await loadKey(keyPath)

    const options = {
      ...receivedOptions,
      ...keyOptions,
      ...optionOverrides
    }

    return (typeof a1 === 'string')
      ? https.request(a1, options, callback)
      : https.request(options, callback)
  }
}

module.exports = clientAuthenticatedHttps
