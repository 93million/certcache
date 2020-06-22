const FeedbackError = require('../FeedbackError')
const debug = require('debug')('certcache:server')

module.exports = ({ actions }) => (req, res) => {
  const data = []

  req.on('data', (chunk) => {
    data.push(chunk)
  })

  req.on('end', async () => {
    const requestBody = data.join('')
    let result

    debug('Request received', requestBody)

    const { action, ...payload } = JSON.parse(requestBody)

    try {
      if (actions[action] === undefined) {
        throw new FeedbackError(`Action '${action}' not found`)
      }

      result = {
        success: true,
        data: await actions[action](payload, { req })
      }
    } catch (error) {
      result = { success: false }

      if (error instanceof FeedbackError) {
        result.error = error.message
      }

      console.error(error)
    }

    // socket might be destroyed during long running requests (eg. delays
    // waiting for DNS updates)
    if (res.socket.destroyed !== true) {
      res.writeHead(
        result.success ? 200 : 500,
        { 'Content-Type': 'application/json' }
      )
      res.write(JSON.stringify(result))
    }
    res.end()
    debug('Response sent')
  })
}
