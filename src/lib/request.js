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

  let _req
  let isDestroyed = false
  const promise = new Promise((resolve, reject) => {
    const response = []

    return clientAuthenticatedHttps
      .request(options, (res) => {
        res.on('data', (data) => response.push(data))
        res.on('end', () => {
          const res = response.join('')

          debug('request() response length', res.length)

          const responseObj = JSON.parse(res)

          if (responseObj.success === true) {
            resolve(responseObj.data)
          } else {
            reject(new Error(responseObj.error))
          }
        })
      })
      .then((req) => {
        _req = req

        if (isDestroyed) {
          req.destroy()
        } else {
          req.on('error', (e) => {
            reject(e)
          })

          debug('request() request', options)
          debug('request() posting', postData)
          req.write(postData)
          req.end()

          return req
        }
      })
  })

  promise.destroy = () => {
    isDestroyed = true

    if (_req !== undefined) {
      _req.destroy()
    }
  }

  return promise
}
