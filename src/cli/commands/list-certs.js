const listCerts = require('../../lib/listCerts')

module.exports = {
  cmd: 'list-certs',
  desc: 'List certificates',
  builder: {
    backends: {
      description: 'Comma-separated list of backends',
      examples: 'sdfdsf'
    }
  },
  handler: (argv) => {
    listCerts(argv).catch((e) => {
      console.error(e)
      process.exit(1)
    })
  }
}
