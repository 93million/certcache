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

const syncPeriodically = async (argv, forever) => {
  const config = (await getConfig()).client

  await syncCerts(argv)
    .catch((e) => {
      console.error(e)

      if (forever !== true) {
        process.exit(1)
      }
    })

  if (forever === true) {
    await setTimeoutPromise(
      () => syncPeriodically(argv, forever),
      1000 * config.syncInterval
    )
  }
}

module.exports = syncPeriodically
