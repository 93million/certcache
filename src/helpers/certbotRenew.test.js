const certbotRenew = require('./certbotRenew')
const child_process = require('child_process')
const config = require('../config')
const getCertbotRenewArgs = require('./getCertbotRenewArgs')

jest.mock('child_process')

child_process.execFile.mockImplementation((exec, args, callback) => {
  callback(null, true)
})

test(
  'should call certbot with the correct arguments',
  async () => {
    await certbotRenew()

    expect(child_process.execFile).toBeCalledWith(
      config.certbotExec,
      getCertbotRenewArgs(config),
      expect.any(Function)
    )
  }
)
