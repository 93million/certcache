const childProcess = require('child_process')
const http = require('http')

module.exports = (args) => {
  return new Promise((resolve) => {
    const ngrokProcess = childProcess.execFile(
      'ngrok',
      args,
      { env: process.env },
      (error, stdout, stderr) => {
        console.log('exec called with ', error, stdout, stderr)
      }
    )
    let tryGetNgrokTunnelTimeout
    const rejectTimeoutSeconds = 10
    const tryGetNgrokTunnel = () => {
      http
        .get(
          'http://localhost:4040/api/tunnels/',
          (res) => {
            res.setEncoding('utf8')
            if (res.statusCode === 200) {
              clearTimeout(rejectTimeout)
              const chunks = []
              res.on('data', (chunk) => {
                chunks.push(chunk)
              })
              res.on('end', () => {
                const response = chunks.join()
                const tunnels = JSON.parse(response).tunnels

                if (tunnels.find(({ proto }) => proto === 'http')) {
                  resolve({ info: { tunnels }, ngrokProcess })
                } else {
                  tryGetNgrokTunnelTimeout = setTimeout(tryGetNgrokTunnel, 300)
                }
              })
            } else {
              tryGetNgrokTunnelTimeout = setTimeout(tryGetNgrokTunnel, 300)
            }
          }
        )
        .on('error', (e) => {
          tryGetNgrokTunnelTimeout = setTimeout(tryGetNgrokTunnel, 300)
        })
    }
    const rejectTimeout = setTimeout(
      () => {
        clearTimeout(tryGetNgrokTunnelTimeout)
        throw new Error(
          `Ngrok took longer than ${rejectTimeoutSeconds} seconds to start`
        )
      },
      rejectTimeoutSeconds * 1000
    )

    tryGetNgrokTunnel()
  })
}
