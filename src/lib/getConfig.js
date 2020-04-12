const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const getConfig = require('../config/getConfig')
const getExtensions = require('./getExtensions')
const fileExists = require('./helpers/fileExists')

const readFile = promisify(fs.readFile)

const localConfigPath = path.resolve(process.cwd(), 'config.json')
const yargs = require('yargs')

let config

const load = async () => {
  const baseStructure = { client: { extensions: {} }, server: { extensions: {} } }
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
  const extensions = await getExtensions()
  const argv = yargs.argv
  const env = process.env
  const baseConfig = getConfig({ argv, env, file: localConfig })

  const extensionConfigs = Object.keys(extensions).reduce(
    (acc, key) => {
      const file = {
        client: localConfig.client.extensions[key] || {},
        server: localConfig.server.extensions[key] || {}
      }

      if (extensions[key].getConfig !== undefined) {
        const { client, server } = extensions[key].getConfig({ argv, env, file })

        acc.client[key] = client
        acc.server[key] = server
      }

      return acc
    },
    { client: {}, server: {} }
  )

  return {
    ...baseConfig,
    client: { ...baseConfig.client, extensions: extensionConfigs.client },
    server: { ...baseConfig.server, extensions: extensionConfigs.server }
  }
}

module.exports = async () => {
  if (config === undefined) {
    config = await load()
  }

  return config
}
