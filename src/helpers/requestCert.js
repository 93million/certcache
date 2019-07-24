const clientAuthenticatedHttps = require('../clientAuthenticatedHttps/clientAuthenticatedHttps')

module.exports = ({host, port}, domains, isTest) => {
  const postData = JSON.stringify({action: 'getCert', domains, isTest})
  const options = {
    headers: {'Content-Length': Buffer.from(postData).length},
    hostname: host,
    method: 'POST',
    path: '/',
    port: port
  }

  return new Promise(async (resolve) => {
    const response = []
    const req = await clientAuthenticatedHttps.request(options, (res) => {
      res.on('data', (data) => response.push(data))
      res.on('end', () => {
        resolve(response.join(''))
      })
    })

    req.on('error', (e) => {
      throw new Error(e)
    })

    req.write(postData)
    req.end()
  })
}
