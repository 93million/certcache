const { https } = require('catkeys')
const actions = require('./actions')
const getConfig = require('../getConfig')
const createRequestHandler = require('./createRequestHandler')

module.exports = async () => {
  const config = (await getConfig())
  const server = await https.createServer(
    { catKeysDir: config.catKeysDir },
    createRequestHandler({ actions })
  )

  server.setTimeout(1000 * 60 * config.maxRequestTime)

  const srv = server.listen(config.server.port)

  process.once('SIGTERM', () => {
    srv.close()
  })
}
