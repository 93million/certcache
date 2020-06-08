const getConfig = require('../../lib/getConfig')
const syncCerts = require('../../lib/client/syncCerts')
const httpRedirect = require('../httpRedirect')
const setTimeoutPromise = require('../helpers/setTimeoutPromise')

const syncPeriodically = async (forever) => {
  const config = (await getConfig())
  let foreverPromise

  if (config.httpRedirectUrl !== undefined) {
    httpRedirect.start(config.httpRedirectUrl)
  }

  const sync = async () => {
    await syncCerts().catch((e) => {
      console.error(e)

      if (forever !== true) {
        process.exit(1)
      }
    })

    if (forever === true) {
      foreverPromise = setTimeoutPromise(sync, 1000 * config.syncInterval * 60)

      await foreverPromise
    } else if (config.httpRedirectUrl !== undefined) {
      httpRedirect.stop()
    }
  }

  process.once('SIGTERM', () => {
    if (foreverPromise !== undefined) {
      foreverPromise.clearTimeout()
    }
  })

  await sync()
}

module.exports = syncPeriodically
