const dns01 = require('./dns01')
const http01 = require('./http01')

module.exports = { 'dns-01': dns01, 'http-01': http01 }
