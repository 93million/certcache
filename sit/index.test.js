const { log, error } = require('console')

/* global afterAll beforeAll describe expect test */

const childProcess = require('child_process')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const loadKey = require('catkeys/lib/loadKey')
const {
  Certificate,
  PrivateKey,
  RSAPrivateKey,
  RSAPublicKey
} = require('@fidm/x509')
const setupTests = require('./lib/setupTests')
const {
  cliCmd,
  testClientDir,
  testServerCatkeysDir,
  testStandaloneDir
} = require('./filepaths')
const yaml = require('yaml')
const http = require('http')

const execFile = promisify(childProcess.execFile)
const readFile = promisify(fs.readFile)

let setup
let ngrokDomain

beforeAll(async () => {
  try {
    setup = await setupTests()
    ngrokDomain = setup
      .ngrok
      .tunnels
      .find(({ proto }) => proto === 'http')
      .public_url
      .replace('http://', '')
  } catch (e) {
    log('beforeAll() failed', e)
    process.exit(1)
  }
})

afterAll(() => setup.cleanup())

describe(
  'certcache server',
  () => {
    test(
      'should have created valid authentication keys',
      async () => {
        const catkey = await loadKey(path.resolve(
          testServerCatkeysDir,
          'server.catkey'
        ))
        log('here is stdout')
        error('here is stderr')
        expect(catkey).toEqual({
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
            '-u',
            '127.0.0.1',
            '-d',
            commonName,
            '--cert-name',
            'thirdparty',
            '--skip-file-perms'
          ],
          { cwd: testClientDir }
        )
        const certPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'thirdparty',
          'cert.pem'
        ))
        const keyPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'thirdparty',
          'privkey.pem'
        ))
        const cert = Certificate.fromPEM(certPem)
        const key = PrivateKey.fromPEM(keyPem)
        const certPublicKey = new RSAPublicKey(cert.publicKey.toASN1())
        const keyPublicKey = new RSAPrivateKey(key.toASN1())

        expect(cert.subject.commonName).toBe(commonName)
        expect(keyPublicKey.modulus).toBe(certPublicKey.modulus)
      }
    )
    test(
      'should generate certificates using certbot',
      async () => {
        await execFile(
          cliCmd,
          [
            'get',
            '-u',
            '127.0.0.1',
            '-d',
            ngrokDomain,
            '--cert-name',
            'certbot',
            '--test-cert',
            '--skip-file-perms'
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
            '-u',
            '127.0.0.1',
            '-d',
            ngrokDomain,
            '--cert-name',
            'certbot',
            '--test-cert',
            '--days',
            30,
            '--skip-file-perms'
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
      [
        'should generate new certificates when cached certs expire within',
        'specified amount of days'
      ].join(' '),
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
            '-u',
            '127.0.0.1',
            '-d',
            ngrokDomain,
            '--cert-name',
            'certbot',
            '--test-cert',
            '--days',
            String(Math.ceil(daysBeforeExpiry) + 1),
            '--skip-file-perms'
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

    test(
      'should sync certificates for domains listed in CERTCACHE_CERTS env var',
      async () => {
        const mockCertcacheDomains = [
          { domains: ['test.example.com'], certName: 'envvar1' },
          { domains: ['foo.example.com'], certName: 'envvar2' }
        ]
        await execFile(
          cliCmd,
          ['sync', '--skip-file-perms'],
          {
            cwd: testClientDir,
            env: {
              ...process.env,
              CERTCACHE_CERTS: yaml.stringify(mockCertcacheDomains),
              CERTCACHE_UPSTREAM: '127.0.0.1'
            }
          }
        )

        const envvar1Pem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'envvar1',
          'cert.pem'
        ))
        const envvar1Cert = Certificate.fromPEM(envvar1Pem)
        const envvar2Pem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'envvar2',
          'cert.pem'
        ))
        const envvar2Cert = Certificate.fromPEM(envvar2Pem)

        expect(envvar1Cert.subject.commonName)
          .toBe(mockCertcacheDomains[0].domains[0])
        expect(envvar2Cert.subject.commonName)
          .toBe(mockCertcacheDomains[1].domains[0])
      }
    )
    test(
      'should run http redirect from client to server',
      async () => {
        const redirectHost = 'http://example.com'
        const env = {
          ...process.env,
          CERTCACHE_HTTP_REDIRECT_URL: redirectHost
        }
        const proc = childProcess.execFile(
          cliCmd,
          ['client'],
          { cwd: testClientDir, env }
        )
        const path = '/.well-known/acme-challenge/foo/'

        await new Promise((resolve) => setTimeout(resolve, 500))

        return new Promise((resolve, reject) => {
          setTimeout(
            () => {
              http.get(
                `http://localhost${path}`,
                (res) => {
                  resolve(res.headers.location)
                }
              )
            },
            200
          )
        })
          .then((locationHeader) => {
            expect(locationHeader).toBe(`${redirectHost}${path}`)
          })
          .finally(() => {
            proc.kill()
          })
      }
    )
    test(
      'should be able to obtain certs in standalone mode without server',
      async () => {
        const commonName = 'standalone.example.com'

        await execFile(
          cliCmd,
          [
            'get',
            '-d',
            commonName,
            '--cert-name',
            'standalone',
            '--skip-file-perms'
          ],
          { cwd: testStandaloneDir }
        )
        const certPem = await readFile(path.resolve(
          testStandaloneDir,
          'certs',
          'standalone',
          'cert.pem'
        ))
        const keyPem = await readFile(path.resolve(
          testStandaloneDir,
          'certs',
          'standalone',
          'privkey.pem'
        ))
        const cert = Certificate.fromPEM(certPem)
        const key = PrivateKey.fromPEM(keyPem)
        const certPublicKey = new RSAPublicKey(cert.publicKey.toASN1())
        const keyPublicKey = new RSAPrivateKey(key.toASN1())

        expect(cert.subject.commonName).toBe(commonName)
        expect(keyPublicKey.modulus).toBe(certPublicKey.modulus)
      }
    )
    test(
      'should execute commands listed in CERTCACHE_CERTS onChange prop',
      async () => {
        const mockCertcacheDomains = [
          {
            domains: ['test.example.com'],
            certName: 'envvar3',
            // eslint-disable-next-line max-len
            onChange: 'cat "$CERTCACHE_CHANGED_DIR/fullchain.pem" "$CERTCACHE_CHANGED_DIR/privkey.pem" | tee "$CERTCACHE_CHANGED_DIR/fullchain-privkey-combined.pem"'
          }
        ]
        await execFile(
          cliCmd,
          ['sync', '--skip-file-perms'],
          {
            cwd: testClientDir,
            env: {
              ...process.env,
              CERTCACHE_CERTS: yaml.stringify(mockCertcacheDomains),
              CERTCACHE_UPSTREAM: '127.0.0.1'
            }
          }
        )

        const fullchainPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'envvar3',
          'fullchain.pem'
        ))
        const privkeyPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'envvar3',
          'privkey.pem'
        ))
        const fullchainPrivkeyCombinedPem = await readFile(path.resolve(
          testClientDir,
          'certs',
          'envvar3',
          'fullchain-privkey-combined.pem'
        ))

        expect(fullchainPrivkeyCombinedPem)
          .toEqual(Buffer.concat([fullchainPem, privkeyPem]))
      }
    )
  }
)
