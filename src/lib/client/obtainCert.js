const request = require('../request')
const writeBundle = require('../writeBundle')
const getConfig = require('../getConfig')
const debug = require('debug')('certcache:obtainCert')
const setTimeoutPromise = require('../helpers/setTimeoutPromise')
const getCert = require('../server/actions/getCert')
const execCommand = require('../execCommand')

module.exports = async (
  host,
  port,
  commonName,
  altNames = [],
  meta,
  certDirPath,
  { catKeysDir, days, onChange }
) => {
  const config = await getConfig()
  const domains = Array.from(new Set([commonName, ...altNames]))
  const payload = { days, domains, meta }

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
      { catKeysDir, host, port },
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

  try {
    const { bundle } = (host === '--internal')
      ? await getCert(payload)
      : await Promise.race([doRequest(), maxRequestTimePromise])

    await writeBundle(certDirPath, bundle)

    if (onChange !== undefined) {
      execCommand(onChange, { CERTCACHE_CHANGED_DIR: certDirPath })
    }
  } catch (e) {
    let message = `Error renewing certificate ${certDirPath}`

    message += ` (${domains.join(',')}). Message: '${e.message}'`

    debug(`Error obtaining bundle`, e.message)

    throw new Error(message)
  } finally {
    maxRequestTimePromise.clearTimeout()
  }
}
