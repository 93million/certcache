const syncCerts = require('../lib/client/syncCerts')

syncCerts().catch((e) => {console.error(`ERROR! ${e}`)})
