const clientAuthenticatedHttps = require('../clientAuthenticatedHttps/clientAuthenticatedHttps')
const actions = require('./actions')

const serve = async () => {
  const server = await clientAuthenticatedHttps.createServer((req, res) => {
    const data = []

    req.on('data', (chunk) => {
      data.push(chunk)
    })

    req.on('end', async () => {
      const requestBody = data.join('')
      let response
      let result

      const {action, ...payload} = JSON.parse(requestBody)

      try {
        result = {success: true, data: await callAction(action, payload)}
      } catch (error) {
        result = {success: false}

        if (error instanceof FeedbackError) {
          result = {...result, error: error.message}
        }
      }

      res.writeHead(
        result.success ? 200 : 500,
        {'Content-Type': 'application/json'}
      )
      res.write(JSON.stringify(result))
      res.end()
    })
  })

  server.listen(4433)
}

class FeedbackError extends Error {}

callAction = (action, payload) => {
  if (actions[action] === undefined) {
    throw new FeedbackError(`Action '${action}' not found`)
  }

  return actions[action](payload)
}

serve().catch((e) => {console.error('ERROR!', e)})
