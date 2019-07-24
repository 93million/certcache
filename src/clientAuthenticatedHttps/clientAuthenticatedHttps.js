const https = require('https')
const { exec } = require('child_process')
const tar = require('tar')
const fs = require('fs')
const uuid = require('uuid')
const path = require('path')
const util = require('util')
const rimraf = require('rimraf')

const rmdir = util.promisify(rimraf)
const readFile = util.promisify(fs.readFile)
const mkdir = util.promisify(fs.mkdir)
const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)
const fileExists = (path) => stat(path).then(() => true).catch((e) => false)

const clientAuthenticatedHttps = {
  ...https,
  async _getCAHKeyPath(cahKey) {
    const keyDir = process.env.CAH_KEY_DIR || await this._locateKeysDir()

    if (cahKey !== undefined) {
      return `${keyDir}/${cahKey}.key`
    } else if (process.env.CAH_KEY_NAME !== undefined) {
      return `${keyDir}/${process.env.CAH_KEY_NAME}.key`
    } else {
      const files = await readdir(keyDir)
      const keys = files.filter(filename => {
        const excludeDirKeys = ['server']
        const [ext, basename] = filename.split('.').reverse()

        return (ext === 'key' && excludeDirKeys.indexOf(basename) === -1)
      })

      if (keys.length !== 1) {
        throw new Error('Too many client keys! Specify one in env CAH_KEY_NAME')
      } else {
        return `${keyDir}/${keys[0]}`
      }
    }
  },
  async _loadKey (keyPath) {
    const tmpBasePath = process.env.CAH_TMP_DIR ||
      '/tmp/client-authenticated-https'
    const tmpPath = `${tmpBasePath}/${uuid()}`

    await mkdir(tmpPath, {recursive: true})
    await tar.x({file: keyPath, cwd: tmpPath})

    const ca = await readFile(`${tmpPath}/ca-crt.pem`)
    const cert = await readFile(`${tmpPath}/crt.pem`)
    const key = await readFile(`${tmpPath}/key.pem`)

    await rmdir(tmpPath)

    return {ca, cert, key}
  },
  async _locateKeysDir () {
    const parentDirs = __dirname.split('/')
    const searchPaths = parentDirs.map((undefined, i, dirs) => (
      `${[...dirs].splice(0, dirs.length - i).join('/')}/cahKeys`
    )).slice(0, parentDirs.length - 1)
    const searchPathResults = await Promise.all(searchPaths.map(fileExists))

    return searchPaths.find((undefined, i) => (searchPathResults[i] === true))
  },
  async createServer (a1, a2) {
    const keyPath = await this._getCAHKeyPath('server')
    const keyOptions = await this._loadKey(keyPath)

    const options = {...keyOptions, requestCert: true, rejectUnauthorized: true}

    return https.createServer(
      (typeof a1 === 'object') ? {...a1, ...options} : options,
      (typeof a1 === 'function') ? a1 : a2
    )
  },
  get (a1, a2, a3) {
    return this.request(a1, a2, a3, {method: 'GET'})
  },
  async request (a1, a2, a3, optionOverrides = {}) {
    const {cahKey, ...receivedOptions} = (typeof a1 === 'object')
      ? a1
      : (typeof a2 === 'object') ? a2 : {}
    const callback = (typeof a2 === 'function') ? a2 : a3

    const keyPath = await this._getCAHKeyPath(cahKey)
    const keyOptions = await this._loadKey(keyPath)

    const options = {
      ...receivedOptions,
      ...keyOptions,
      ...optionOverrides
    }

    return (typeof a1 === 'string')
      ? https.request(a1, options, callback)
      : https.request(options, callback)
  }
}

module.exports = clientAuthenticatedHttps
