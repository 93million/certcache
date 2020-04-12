const request = require('../request')
const writeBundle = require('../writeBundle')
const debug = require('debug')('certcache:obtainCert')

module.exports = async (
  host,
  port,
  commonName,
  altNames = [],
  meta,
  certDirPath,
  { cahKeysDir, days }
) => {
  const domains = Array.from(new Set([commonName, ...altNames]))

  console.log([
    `Requesting certificate CN=${commonName}`,
    `SAN=${JSON.stringify(domains)}`,
    `meta=${JSON.stringify(meta)}`
  ].join(' '))

  const response = await request(
    { cahKeysDir, host, port },
    'getCert',
    { days, domains, meta }
  )

  if (response.success === true) {
    await writeBundle(certDirPath, response.data.bundle)
  } else {
    let message = `Error renewing certificate ${certDirPath}`

    message += ` (${domains.join(',')})`

    debug(`Error obtaining bundle`, response)

    if (response.error !== undefined) {
      message += `. Message from server: '${response.error}'`
    }

    throw new Error(message)
  }
}
