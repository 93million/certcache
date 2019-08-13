const util = require('util')
const fs = require('fs')
const stat = util.promisify(fs.stat)

module.exports = (path) => stat(path).then(() => true).catch((e) => false)
