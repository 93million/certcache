const requestCert = require('../requestCert')
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

  const response = await requestCert(
    { cahKeysDir, host, port },
    { days, domains, meta }
  )
  const responseObj = JSON.parse(response)

  if (responseObj.success === true) {
    await writeBundle(certDirPath, responseObj.data.bundle)
  } else {
    let message = `Error renewing certificate ${certDirPath}`

    message += ` (${domains.join(',')})`

    debug(`Error obtaining bundle`, responseObj)

    if (responseObj.error !== undefined) {
      message += `. Message from server: '${responseObj.error}'`
    }

    throw new Error(message)
  }
}
