const fs = require('fs')
const os = require('os')
const path = require('path')
const tar = require('tar')
const rimraf = require('rimraf')
const util = require('util')

const rmdir = util.promisify(rimraf)
const readFile = util.promisify(fs.readFile)
const mkdtemp = util.promisify(fs.mkdtemp)

module.exports = async (keyPath) => {
  const tmpDir = await mkdtemp(
    path.join(os.tmpdir(), 'com.93million.cahkeys.')
  )

  await tar.x({ file: keyPath, cwd: tmpDir })

  const ca = await readFile(`${tmpDir}/ca-crt.pem`)
  const cert = await readFile(`${tmpDir}/crt.pem`)
  const key = await readFile(`${tmpDir}/key.pem`)

  await rmdir(tmpDir)

  return { ca, cert, key }
}
