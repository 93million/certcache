const clientAuthenticatedHttps = require('client-authenticated-https')
const actions = require('./actions')
const FeedbackError = require('../FeedbackError')
const debug = require('debug')('certcache:server')

module.exports = async (opts) => {
  const server = await clientAuthenticatedHttps.createServer((req, res) => {
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
        result = { success: true, data: await callAction(action, payload, req) }
      } catch (error) {
        result = { success: false }

        if (error instanceof FeedbackError) {
          result = { ...result, error: error.message }
        }

        console.error(error)
      }

      res.writeHead(
        result.success ? 200 : 500,
        { 'Content-Type': 'application/json' }
      )
      res.write(JSON.stringify(result))
      res.end()
      debug('Response sent')
    })
  })

  server.listen(opts.port)
}

const callAction = (action, payload, req) => {
  if (actions[action] === undefined) {
    throw new FeedbackError(`Action '${action}' not found`)
  }

  return actions[action](payload, { req })
}
