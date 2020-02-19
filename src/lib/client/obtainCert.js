const requestCert = require('../requestCert')
const writeBundle = require('../writeBundle')
const debug = require('debug')('certcache:obtainCert')

module.exports = async (
  host,
  port,
  commonName,
  altNames,
  isTest,
  certDirPath
) => {
  const domains = Array.from(new Set([commonName, ...altNames]))

  console.log([
    `Requesting certificate CN=${commonName}`,
    `SAN=${JSON.stringify(domains)}`,
    isTest ? 'test' : 'live'
  ].join(' '))

  const response = await requestCert({ host, port }, domains, { isTest })
  const responseObj = JSON.parse(response)

  if (responseObj.success === true) {
    await writeBundle(certDirPath, responseObj.data.bundle)
  } else {
    let message = `Error renewing certificate ${certDirPath}`

    debug(`Error obtaining bundle`, responseObj)

    if (responseObj.error !== undefined) {
      message += ` - message: '${responseObj.error}'`
    }

    throw new Error(message)
  }
}
