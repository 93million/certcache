const getConfig = require('../../lib/getConfig')
const syncCerts = require('../../lib/client/syncCerts')
const httpRedirect = require('../httpRedirect')
const setTimeoutPromise = require('../helpers/setTimeoutPromise')

let httpRedirectLaunched

const syncPeriodically = async (forever) => {
  const config = (await getConfig())

  if (config.httpRedirectUrl !== undefined && httpRedirectLaunched !== true) {
    httpRedirect.start(config.httpRedirectUrl)
    httpRedirectLaunched = true
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
  } else if (config.httpRedirectUrl !== undefined) {
    httpRedirect.stop()
    httpRedirectLaunched = false
  }
}

module.exports = syncPeriodically
