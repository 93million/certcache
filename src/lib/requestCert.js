const clientAuthenticatedHttps = require('client-authenticated-https')
const debug = require('debug')('certcache:requestCert')

module.exports = ({ host, port, cahKeysDir }, domains, extras) => {
  const postData = JSON.stringify({ action: 'getCert', domains, extras })
  const options = {
    cahKeysDir,
    headers: { 'Content-Length': Buffer.from(postData).length },
    hostname: host,
    method: 'POST',
    path: '/',
    port
  }

  return new Promise((resolve, reject) => {
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
          reject(e)
        })

        debug('requestCert() request', options)
        debug('requestCert() posting', postData)
        req.write(postData)
        req.end()
      })
  })
}
