const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const getConfig = require('../config/getConfig')
const getBackends = require('./getBackends')
const fileExists = require('./helpers/fileExists')

const readFile = promisify(fs.readFile)

const localConfigPath = path.resolve(process.cwd(), 'config.json')
const yargs = require('yargs')

let config

const load = async () => {
  const bare = { client: {}, server: { backends: {} } }
  const localConfig = await fileExists(localConfigPath)
    ? { ...bare, ...JSON.parse(await readFile(localConfigPath)) }
    : bare
  const backends = await getBackends()
  const argv = yargs.argv
  const env = process.env
  const baseConfig = getConfig({ argv, env, file: localConfig })

  return {
    ...baseConfig,
    server: {
      ...baseConfig.server,
      backends: Object.keys(backends).reduce(
        (acc, key) => {
          const file = localConfig.server.backends[key] || {}

          if (backends[key].getConfig !== undefined) {
            acc[key] = backends[key].getConfig({ argv, env, file })
          }

          return acc
        },
        {}
      )
    }
  }
}

module.exports = async () => {
  if (config === undefined) {
    config = await load()
  }

  return config
}
