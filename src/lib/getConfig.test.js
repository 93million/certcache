/* global jest beforeAll expect test */

const getConfig = require('./getConfig')
const fs = require('fs')
const fileExists = require('./helpers/fileExists')
const getExtensions = require('./getExtensions')
const mainConfigFn = require('../config/config')
const yargs = require('yargs')

jest.mock('fs')
jest.mock('./helpers/fileExists')
jest.mock('./getExtensions')
jest.mock('../config/config')

const mockFileConfig = {
  client: { foo: 123 },
  server: { bar: 345 },
  test1: 123,
  test2: 456
}
const baseFileConfig = {
  client: { extensions: {} },
  server: { extensions: {} }
}
const mockMainConfig = {
  mainItem1: 123,
  mainItem2: 'def'
}
const mockFileBaseCombined = {
  ...baseFileConfig,
  client: { ...baseFileConfig.client, ...mockFileConfig.client },
  server: { ...baseFileConfig.server, ...mockFileConfig.server }
}

fs.readFile.mockImplementation((path, callback) => {
  callback(null, JSON.stringify(mockFileConfig))
})

mainConfigFn.mockReturnValue(mockMainConfig)

const mockExtensionConfig = { client: { ext: 'abd' }, server: { ext: 'def' } }

const mockExtensionConfigFn = jest.fn()
mockExtensionConfigFn.mockReturnValue(mockExtensionConfig)

const mockExtensions = {
  ext1: { config: mockExtensionConfigFn },
  extWithoutConfig: {}
}
getExtensions.mockReturnValue(Promise.resolve(mockExtensions))

fileExists.mockReturnValue(Promise.resolve(true))

let config

beforeAll(async () => {
  config = await getConfig()
})

test(
  'local file configs should extend a base structure',
  async () => {
    expect(config).toMatchObject(mockMainConfig)
  }
)

test(
  'should pass argv, env and file based configs to global config functions',
  async () => {
    expect(mainConfigFn).toBeCalledWith({
      argv: yargs.argv,
      env: process.env,
      file: mockFileBaseCombined
    })
  }
)

test(
  'should pass argv, env and file based configs to extension config functions',
  async () => {
    expect(mockExtensionConfigFn).toBeCalledWith({
      argv: yargs.argv,
      env: process.env,
      file: { client: {}, server: {} }
    })
  }
)

test(
  'should skip extensions that do not provide config functions',
  () => {
    expect(config).not.toMatchObject({
      client: { extensions: { extWithoutConfig: expect.any(Object) } },
      server: { extensions: { extWithoutConfig: expect.any(Object) } }
    })
  }
)

test(
  'should structure extension configs inside server object',
  () => {
    expect(config).toMatchObject({
      server: { extensions: { ext1: expect.any(Object) } }
    })
  }
)

test(
  'should structure extension configs inside client object',
  () => {
    expect(config).toMatchObject({
      client: { extensions: { ext1: expect.any(Object) } }
    })
  }
)

test(
  'should cache results of getConfig() for reuse',
  async () => {
    await getConfig()

    expect(mainConfigFn).toBeCalledTimes(1)
    expect(mockExtensionConfigFn).toBeCalledTimes(1)
  }
)
