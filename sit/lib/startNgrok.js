const childProcess = require('child_process')
const http = require('http')

module.exports = (args) => {
  return new Promise((resolve) => {
    const process = childProcess.execFile('ngrok', args)
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
                const tunnels = JSON.parse(chunks.join()).tunnels

                if (tunnels.length === 2) {
                  resolve({ info: { tunnels }, process })
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
