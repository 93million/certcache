const syncCerts = require('./syncCerts')

syncCerts().catch((e) => {
  console.error(e)
  process.exit(1)
})
