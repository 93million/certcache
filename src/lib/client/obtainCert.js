const request = require('../request')
const writeBundle = require('../writeBundle')
const getConfig = require('../getConfig')
const debug = require('debug')('certcache:obtainCert')
const setTimeoutPromise = require('../helpers/setTimeoutPromise')

module.exports = async (
  host,
  port,
  commonName,
  altNames = [],
  meta,
  certDirPath,
  { cahKeysDir, days }
) => {
  const config = await getConfig()
  const domains = Array.from(new Set([commonName, ...altNames]))

  console.log([
    `Requesting certificate CN=${commonName}`,
    `SAN=${JSON.stringify(domains)}`,
    `meta=${JSON.stringify(meta)}`
  ].join(' '))

  const { maxRequestTime } = config
  const maxRequestTimePromise = setTimeoutPromise(
    () => {
      throw new Error([
        'obtainCert() took more than',
        maxRequestTime,
        'minutes'
      ].join(' '))
    },
    1000 * 60 * maxRequestTime
  )

  const doRequest = () => new Promise((resolve, reject) => {
    const req = request(
      { cahKeysDir, host, port },
      'getCert',
      { days, domains, meta }
    )

    const requestTimeoutMs = 1000 * 60 * config.httpRequestInterval
    const requestTimeout = setTimeout(
      () => {
        debug([
          'Aborting and retrying request for cert - took more than',
          requestTimeoutMs,
          'MS'
        ].join(' '))

        req.destroy()

        resolve(doRequest())
      },
      requestTimeoutMs
    )

    req
      .then((response) => {
        resolve(response)
      })
      .catch((e) => {
        reject(e)
      })
      .finally(() => {
        clearTimeout(requestTimeout)
      })
  })

  const response = await Promise
    .race([doRequest(), maxRequestTimePromise])
    .finally(() => {
      maxRequestTimePromise.clearTimeout()
    })

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
