const clientAuthenticatedHttps =
  require('../lib/clientAuthenticatedHttps/clientAuthenticatedHttps')
const debug = require('debug')('certcache:requestCert')

module.exports = ({ host, port }, domains, isTest) => {
  const postData = JSON.stringify({ action: 'getCert', domains, isTest })
  const options = {
    headers: { 'Content-Length': Buffer.from(postData).length },
    hostname: host,
    method: 'POST',
    path: '/',
    port
  }

  return new Promise((resolve) => {
    const response = []

    clientAuthenticatedHttps
      .request(options, (res) => {
        res.on('data', (data) => response.push(data))
        res.on('end', () => {
          const res = response.join('')

          debug('requestCert() response length', res.length)

          resolve(res)
        })
      })
      .then((req) => {
        req.on('error', (e) => {
          throw new Error(e)
        })

        debug('requestCert() request', options)
        debug('requestCert() posting', postData)
        req.write(postData)
        req.end()
      })
  })
}
