/* global jest test expect beforeEach */

const childProcess = require('child_process')
const generateCert = require('./generateCert')
const generateCertName = require('./lib/generateCertName')
const getConfig = require('../../lib/getConfig')

jest.mock('child_process')
jest.mock('../../lib/getConfig')

const commonName = 'test.example.com'
const altNames = ['test.example.com', 'test1.example.com', 'foo.jimmy.bar']
let certbotConfig

beforeEach(async () => {
  childProcess.execFile.mockReset()
  childProcess.execFile.mockImplementation((exec, args, callback) => {
    callback(null, true)
  })
  certbotConfig = (await getConfig()).server.backends.certbot
})

test(
  'should not create duplicate requests for the same certificate',
  async () => {
    await Promise.all([
      generateCert(commonName, altNames, { isTest: true }),
      generateCert(commonName, altNames, { isTest: true })
    ])

    expect(childProcess.execFile).toBeCalledTimes(1)
  }
)

test(
  'should return path to newly generated certificate',
  async () => {
    const certPath = await generateCert(commonName, altNames, true)
    const certName = generateCertName(commonName, altNames, true)

    expect(certPath)
      .toBe(`${certbotConfig.certbotConfigDir}/live/${certName}/cert.pem`)
  }
)

test(
  'should throw errors encountered',
  async () => {
    childProcess.execFile.mockReset()
    childProcess.execFile.mockImplementation((exec, args, callback) => {
      callback(new Error('certbot exited with error'), null)
    })

    await expect(generateCert(commonName, altNames, true))
      .rejects
      .toThrow()
  }
)
