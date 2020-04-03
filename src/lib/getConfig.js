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
  const baseStructure = { client: { backends: {} }, server: { backends: {} } }
  const localFileConfig = await fileExists(localConfigPath)
    ? JSON.parse(await readFile(localConfigPath))
    : undefined
  const localConfig = (localFileConfig !== undefined)
    ? {
      ...baseStructure,
      client: { ...baseStructure.client, ...localFileConfig.client },
      server: { ...baseStructure.server, ...localFileConfig.server }
    }
    : baseStructure
  const backends = await getBackends()
  const argv = yargs.argv
  const env = process.env
  const baseConfig = getConfig({ argv, env, file: localConfig })

  const backendConfigs = Object.keys(backends).reduce(
    (acc, key) => {
      const file = {
        client: localConfig.client.backends[key] || {},
        server: localConfig.server.backends[key] || {}
      }

      if (backends[key].getConfig !== undefined) {
        const { client, server } = backends[key].getConfig({ argv, env, file })

        acc.client[key] = client
        acc.server[key] = server
      }

      return acc
    },
    { client: {}, server: {} }
  )

  return {
    ...baseConfig,
    client: { ...baseConfig.client, backends: backendConfigs.client },
    server: { ...baseConfig.server, backends: backendConfigs.server }
  }
}

module.exports = async () => {
  if (config === undefined) {
    config = await load()
  }

  return config
}
