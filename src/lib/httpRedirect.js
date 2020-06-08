const http = require('http')

let redirectServer

module.exports.start = (httpRedirectUrl) => {
  if (httpRedirectUrl.endsWith('/')) {
    httpRedirectUrl = httpRedirectUrl.substring(0, httpRedirectUrl.length - 1)
  }

  redirectServer = http.createServer((req, res) => {
    if (req.url.startsWith('/.well-known/')) {
      res.writeHead(302, { Location: `${httpRedirectUrl}${req.url}` })
    }

    res.end()
  }).listen(80)
}

const stop = () => {
  if (redirectServer !== undefined) {
    redirectServer.close()
    redirectServer = undefined
  }
}

process.on('SIGTERM', () => stop())

module.exports.stop = stop
