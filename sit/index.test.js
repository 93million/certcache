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

let cleanup

beforeAll(async () => {
  cleanup = await setupTests()
})

afterAll(async () => {
  await cleanup()
})

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
      'should get certificate from server',
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
            'testcert'
          ],
          { cwd: testClientDir }
        )
        const pem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'testcert',
          'cert.pem'
        ))
        const cert = Certificate.fromPEM(pem)

        expect(cert.subject.commonName).toBe(commonName)
      }
    )
  }
)
