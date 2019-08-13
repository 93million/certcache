const getCert = require('../lib/client/getCert')

getCert().catch((e) => { console.error('ERROR!', e) })
