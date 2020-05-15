/* global jest test expect beforeEach */

const childProcess = require('child_process')
const generateCert = require('./generateCert')
const generateCertName = require('./lib/generateCertName')
const getConfig = require('../../lib/getConfig')
const getChallengeFromDomains = require('./lib/getChallengeFromDomains')
const FeedbackError = require('../../lib/FeedbackError')

jest.mock('child_process')
jest.mock('../../lib/getConfig')
jest.mock('./lib/getChallengeFromDomains')

const commonName = 'test.example.com'
const altNames = ['test.example.com', 'test1.example.com', 'test.93million.com']
const mockChallenge = { certonlyArgs: ['--test-arg1', '--test-arg2'] }
const meta = { isTest: true }
let certbotConfig

getChallengeFromDomains.mockReturnValue(mockChallenge)

beforeEach(async () => {
  childProcess.execFile.mockReset()
  childProcess.execFile.mockImplementation((exec, args, callback) => {
    callback(null, true)
  })
  certbotConfig = (await getConfig()).extensions.certbot
})

test(
  'should not create duplicate requests for the same certificate',
  async () => {
    await Promise.all([
      generateCert(commonName, altNames, meta),
      generateCert(commonName, altNames, meta)
    ])

    expect(childProcess.execFile).toBeCalledTimes(1)
  }
)

test(
  'should return path to newly generated certificate',
  async () => {
    const certPath = await generateCert(commonName, altNames, meta)
    const certName = generateCertName(commonName, altNames, meta)

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

    await expect(generateCert(commonName, altNames, meta))
      .rejects
      .toThrow('certbot exited with error')
  }
)

test(
  'should throw feedback error if common challenge cannot be found for domains',
  async () => {
    getChallengeFromDomains.mockReturnValueOnce(undefined)

    await expect(generateCert(commonName, altNames, meta))
      .rejects
      .toThrow(FeedbackError)
  }
)
