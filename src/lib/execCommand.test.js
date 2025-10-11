/* global jest test expect */

const execCommand = require('./execCommand')
const childProcess = require('child_process')
const path = require('path')
const getConfig = require('./getConfig')

jest.mock('child_process')
jest.mock('./getConfig')

const mockCommand = 'command 1'
const mockEnv = { MOCK_ENV_1: 'mock value 1' }

childProcess.exec.mockImplementation((command, options, callback) => {
  callback(null)
})

test(
  'should execute each command in commands arg array',
  async () => {
    await execCommand(mockCommand, mockEnv)

    expect(childProcess.exec).toHaveBeenCalledWith(
      mockCommand,
      expect.any(Object),
      expect.any(Function)
    )
  }
)

test(
  'should extend process.env vars with extraEnv arg when calling commands',
  async () => {
    await execCommand(mockCommand, mockEnv)

    expect(childProcess.exec).toHaveBeenCalledWith(
      mockCommand,
      { env: { ...process.env, ...mockEnv, PATH: expect.any(String) } },
      expect.any(Function)
    )
  }
)

test(
  'should add config.binDir to PATH',
  async () => {
    const config = await getConfig()

    await execCommand(mockCommand, mockEnv)

    expect(childProcess.exec).toHaveBeenCalledWith(
      mockCommand,
      {
        env: {
          ...process.env,
          ...mockEnv,
          PATH: `${process.env.PATH}:${path.resolve(config.binDir)}`
        }
      },
      expect.any(Function)
    )
  }
)
