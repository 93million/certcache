const clientAuthenticatedHttps = require('client-authenticated-https')
const debug = require('debug')('certcache:request')

module.exports = (
  { host, port, cahKeysDir },
  action,
  payload = {}
) => {
  const postData = JSON.stringify({ action, ...payload })
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

          debug('request() response length', res.length)

          resolve(JSON.parse(res))
        })
      })
      .then((req) => {
        req.on('error', (e) => {
          reject(e)
        })

        debug('request() request', options)
        debug('request() posting', postData)
        req.write(postData)
        req.end()
      })
  })
}