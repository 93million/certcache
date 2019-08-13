const getCert = require('../helpers/client/getCert')

getCert().catch((e) => {console.error('ERROR!', e)})
