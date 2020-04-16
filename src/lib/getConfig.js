const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const config = require('../config/config')
const getExtensions = require('./getExtensions')
const fileExists = require('./helpers/fileExists')

const readFile = promisify(fs.readFile)

const fileConfigPath = path.resolve(process.cwd(), 'config.json')
const yargs = require('yargs')

let cachedConfig

const load = async () => {
  const fileConfigBase = {
    client: { extensions: {} },
    server: { extensions: {} }
  }
  const localFileConfig = await fileExists(fileConfigPath)
    ? JSON.parse(await readFile(fileConfigPath))
    : undefined
  const fileConfig = (localFileConfig !== undefined)
    ? {
      ...fileConfigBase,
      client: { ...fileConfigBase.client, ...localFileConfig.client },
      server: { ...fileConfigBase.server, ...localFileConfig.server }
    }
    : fileConfigBase
  const extensions = await getExtensions()
  const argv = yargs.argv
  const env = process.env
  const mainConfig = config({ argv, env, file: fileConfig })

  const extensionConfigs = Object.keys(extensions).reduce(
    (acc, key) => {
      if (extensions[key].config !== undefined) {
        const file = {
          client: fileConfig.client.extensions[key] || {},
          server: fileConfig.server.extensions[key] || {}
        }
        const { client, server } = extensions[key].config({ argv, env, file })

        acc.client[key] = client
        acc.server[key] = server
      }

      return acc
    },
    { client: {}, server: {} }
  )

  return {
    ...mainConfig,
    client: { ...mainConfig.client, extensions: extensionConfigs.client },
    server: { ...mainConfig.server, extensions: extensionConfigs.server }
  }
}

module.exports = async () => {
  if (cachedConfig === undefined) {
    cachedConfig = await load()
  }

  return cachedConfig
}
