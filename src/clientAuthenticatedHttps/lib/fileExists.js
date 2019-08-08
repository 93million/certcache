const fs = require('fs')
const util = require('util')
const stat = util.promisify(fs.stat)

module.exports = (path) => stat(path).then(() => true).catch((e) => false)
