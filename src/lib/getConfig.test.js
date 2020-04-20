/* global jest expect test */

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
  test1: 123,
  test2: 456,
  test3: { foo: 123 },
  test4: { bar: 345 }
}
const baseFileConfig = { extensions: {}, server: {} }
const mockMainConfig = {
  mainItem1: 123,
  mainItem2: 'def'
}
const mockFileBaseCombined = {
  ...baseFileConfig,
  ...mockFileConfig
}

fs.readFile.mockImplementation((path, callback) => {
  callback(null, JSON.stringify(mockFileConfig))
})

mainConfigFn.mockReturnValue(mockMainConfig)

const mockExtensionConfig = { ext1: 'abd', ext2: { test1: 'def' } }

const mockExtensionConfigFn = jest.fn()
mockExtensionConfigFn.mockReturnValue(mockExtensionConfig)

const mockExtensions = {
  ext1: { config: mockExtensionConfigFn },
  extWithoutConfig: {}
}
getExtensions.mockReturnValue(Promise.resolve(mockExtensions))

fileExists.mockReturnValue(Promise.resolve(true))

test(
  'local file configs should extend a base structure',
  async () => {
    expect(await getConfig()).toMatchObject(mockMainConfig)
  }
)

test(
  'should pass argv, env and file based configs to global config functions',
  async () => {
    await getConfig({ noCache: true })

    expect(mainConfigFn).toBeCalledWith({
      argv: yargs.argv,
      env: process.env,
      file: mockFileBaseCombined
    })
  }
)

test(
  'should use a base config structure when no file based config exists',
  async () => {
    fileExists.mockReturnValueOnce(false)

    await getConfig({ noCache: true })

    expect(mainConfigFn).toBeCalledWith({
      argv: yargs.argv,
      env: process.env,
      file: baseFileConfig
    })
  }
)

test(
  'should pass argv, env and file based configs to extension config functions',
  async () => {
    await getConfig({ noCache: true })

    expect(mockExtensionConfigFn).toBeCalledWith({
      argv: yargs.argv,
      env: process.env,
      file: {}
    })
  }
)

test(
  'should skip extensions that do not provide config functions',
  async () => {
    const config = await getConfig({ noCache: true })

    expect(config).toMatchObject({
      extensions: { ext1: expect.any(Object) }
    })

    expect(config).not.toMatchObject({
      extensions: { extWithoutConfig: expect.any(Object) }
    })
  }
)

test(
  'should structure extension configs inside extensions object',
  async () => {
    expect(await getConfig({ noCache: true })).toMatchObject({
      extensions: { ext1: expect.any(Object) }
    })
  }
)

test(
  'should cache results of getConfig() for reuse',
  async () => {
    await getConfig({ noCache: true })

    expect(mainConfigFn).toBeCalledTimes(1)
    expect(mockExtensionConfigFn).toBeCalledTimes(1)
  }
)
