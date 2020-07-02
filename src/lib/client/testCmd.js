const getConfig = require('../getConfig')
const request = require('../request')
const canonicaliseUpstreamConfig = require('../canonicaliseUpstreamConfig')

module.exports = async () => {
  const config = await getConfig()
  const { host, port } = canonicaliseUpstreamConfig(config.upstream)

  if (host === '--internal') {
    console.log('No upstream server. Running in standalone mode')
  } else {
    try {
      const { cahKeysDir } = config
      const { version } = await request({ cahKeysDir, host, port }, 'getInfo')

      console.log([
        'Connected successfully to server',
        `${host}:${port}`,
        'running version',
        version
      ].join(' '))
    } catch (e) {
      console.error('Error', e.message)
      process.exit(1)
    }
  }
}
