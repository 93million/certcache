const getConfig = require('../getConfig')
const request = require('../request')
const canonicaliseUpstreamConfig = require('../canonicaliseUpstreamConfig')

module.exports = async () => {
  const config = await getConfig()
  const { cahKeysDir, upstream } = config
  const { host, port } = canonicaliseUpstreamConfig(upstream)

  try {
    const response = await request({ cahKeysDir, host, port }, 'getInfo')
    const { error, version } = response.data

    if (response.success === true) {
      console.log([
        'Connected sucessfully to server',
        `${host}:${port}`,
        'running version',
        version
      ].join(' '))
    } else {
      console.log(`Connected to ${host}:${port} but received error ${error}`)
    }
  } catch (e) {
    console.error('Error', e.message)
    process.exit(1)
  }
}
