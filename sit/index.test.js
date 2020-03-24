/* global afterAll beforeAll describe expect test */

const childProcess = require('child_process')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const loadKey = require('client-authenticated-https/lib/loadKey')
const { Certificate } = require('@fidm/x509')
const setupTests = require('./lib/setupTests')
const { cliCmd, testClientDir, testServerCahkeysDir } = require('./filepaths')

const execFile = promisify(childProcess.execFile)
const readFile = promisify(fs.readFile)

let setup
let ngrokDomain

beforeAll(async () => {
  setup = await setupTests()
  ngrokDomain = setup
    .ngrok
    .tunnels
    .find(({ proto }) => proto === 'http')
    .public_url
    .replace('http://', '')
})

afterAll(() => setup.cleanup())

describe(
  'certcache server',
  () => {
    test(
      'should have created valid authentication keys',
      async () => {
        const cahkey = await loadKey(path.resolve(
          testServerCahkeysDir,
          'server.cahkey'
        ))

        expect(cahkey).toEqual({
          ca: expect.any(Buffer),
          cert: expect.any(Buffer),
          key: expect.any(Buffer)
        })
      }
    )
  }
)

describe(
  'certcache client',
  () => {
    test(
      'should get 3rd party certificate from server',
      async () => {
        const commonName = 'test.example.com'

        await execFile(
          cliCmd,
          [
            'get',
            '-h',
            'localhost',
            '-d',
            commonName,
            '--cert-name',
            'thirdparty'
          ],
          { cwd: testClientDir }
        )
        const pem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'thirdparty',
          'cert.pem'
        ))
        const cert = Certificate.fromPEM(pem)

        expect(cert.subject.commonName).toBe(commonName)
      }
    )
    test(
      'should generate certificates using certbot',
      async () => {
        await execFile(
          cliCmd,
          [
            'get',
            '-h',
            'localhost',
            '-d',
            ngrokDomain,
            '--cert-name',
            'certbot',
            '--test-cert'
          ],
          { cwd: testClientDir }
        )
        const pem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'certbot',
          'cert.pem'
        ))
        const cert = Certificate.fromPEM(pem)

        expect(cert.subject.commonName).toBe(ngrokDomain)
      }
    )

    test(
      'should cache certificates after generation',
      async () => {
        const origPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'certbot',
          'cert.pem'
        ))
        const origCert = Certificate.fromPEM(origPem)

        await execFile(
          cliCmd,
          [
            'get',
            '-h',
            'localhost',
            '-d',
            ngrokDomain,
            '--cert-name',
            'certbot',
            '--test-cert'
          ],
          { cwd: testClientDir }
        )

        const newPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'certbot',
          'cert.pem'
        ))
        const newCert = Certificate.fromPEM(newPem)

        expect(newCert.serialNumber).toBe(origCert.serialNumber)
      }
    )

    test(
      'should generate new certificates expiring after specified amount of days',
      async () => {
        const origPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'certbot',
          'cert.pem'
        ))
        const origCert = Certificate.fromPEM(origPem)
        const origCertExpires = origCert.validTo
        const msPerDay = 1000 * 60 * 60 * 24
        const daysBeforeExpiry = (origCertExpires.getTime() - Date.now()) /
          msPerDay

        await execFile(
          cliCmd,
          [
            'get',
            '-h',
            'localhost',
            '-d',
            ngrokDomain,
            '--cert-name',
            'certbot',
            '--test-cert',
            '--days',
            String(Math.ceil(daysBeforeExpiry) + 1)
          ],
          { cwd: testClientDir }
        )

        const newPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'certbot',
          'cert.pem'
        ))
        const newCert = Certificate.fromPEM(newPem)

        expect(newCert.serialNumber).not.toBe(origCert.serialNumber)
      }
    )
  }
)
