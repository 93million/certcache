const child_process = require('child_process')
const config = require('../../config')
const generateCert = require('./generateCert')
const generateCertName = require('../../lib/generateCertName')

jest.mock('child_process')

let firstCallback

const commonName = 'test.example.com'
const altNames = ['test.example.com', 'test1.example.com', 'foo.jimmy.bar']
const certName = generateCertName(commonName, altNames, true)
const certbotConfig = {...config, letsencryptEmail: 'test@example.com'}

beforeEach(() => {
  child_process.execFile.mockReset()
  child_process.execFile.mockImplementation((exec, args, callback) => {
    callback(null, true)
  })
})

test(
  'should not create duplicate requests for the same certificate',
  async () => {
    await Promise.all([
      generateCert(commonName, altNames, true, certbotConfig),
      generateCert(commonName, altNames, true, certbotConfig)
    ])

    expect(child_process.execFile).toBeCalledTimes(1)
  }
)

test(
  'should return path to newly generated certificate',
  async () => {
    const certPath = await generateCert(
      commonName,
      altNames,
      true,
      certbotConfig
    )
    const certName = generateCertName(commonName, altNames, true)

    expect(certPath)
      .toBe(`${config.certbotConfigDir}/live/${certName}/cert.pem`)
  }
)

test(
  'should throw errors encountered',
  async () => {
    child_process.execFile.mockReset()
    child_process.execFile.mockImplementation((exec, args, callback) => {
      callback(new Error('certbot exited with error'), null)
    })

    await expect(generateCert(
      commonName,
      altNames,
      true,
      certbotConfig
    ))
      .rejects
      .toThrow()
  }
)
