const syncCerts = require('./syncCerts')

syncCerts().catch((e) => {
  console.error(`ERROR! ${e}`)
  process.exit(1)
})
