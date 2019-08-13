const syncCerts = require('../helpers/client/syncCerts')

syncCerts().catch((e) => {console.error(`ERROR! ${e}`)})
