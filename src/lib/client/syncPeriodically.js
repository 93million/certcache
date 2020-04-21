const getConfig = require('../../lib/getConfig')
const syncCerts = require('../../lib/client/syncCerts')

const setTimeoutPromise = (callback, ms) => new Promise((resolve) => {
  setTimeout(
    async () => {
      resolve(await callback())
    },
    ms
  )
})

const syncPeriodically = async (forever) => {
  const config = (await getConfig())

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
