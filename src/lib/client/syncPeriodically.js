const getConfig = require('../../lib/getConfig')
const syncCerts = require('../../lib/client/syncCerts')
const httpRedirect = require('../httpRedirect')
const setTimeoutPromise = require('../helpers/setTimeoutPromise')

const syncPeriodically = async (forever) => {
  const config = (await getConfig())

  if (config.httpRedirectUrl !== undefined) {
    httpRedirect.start(config.httpRedirectUrl)
  }

  await syncCerts()
    .catch((e) => {
      console.error(e)

      if (forever !== true) {
        process.exit(1)
      }
    })

  if (forever === true) {
    await setTimeoutPromise(
      () => syncPeriodically(forever),
      1000 * config.syncInterval * 60
    )
  }
}

module.exports = syncPeriodically
