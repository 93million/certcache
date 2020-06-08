/* global jest test expect beforeAll  */

const syncCerts = require('./syncCerts')
const getLocalCertificates = require('../getLocalCertificates')
const canonicaliseUpstreamConfig = require('../canonicaliseUpstreamConfig')
const obtainCert = require('./obtainCert')
const path = require('path')
const getConfig = require('../getConfig')

jest.mock('../getLocalCertificates')
jest.mock('./obtainCert')
jest.mock('../getConfig')

let config
const certcacheCertDir = '/test/certcache/certs'

const generateMockCert = (
  tld,
  isTest = true,
  daysBeforeExpiry,
  { skipAltNames = false } = {}
) => {
  const notAfter = new Date()
  const altNames = skipAltNames ? undefined : [tld, `www.${tld}`, `test.${tld}`]

  notAfter.setDate(notAfter.getDate() + daysBeforeExpiry)

  return {
    commonName: tld,
    altNames,
    issuerCommonName: isTest
      ? 'Fake LE Intermediate X1'
      : 'Let\'s Encrypt Authority X3',
    notAfter,
    certPath: `${certcacheCertDir}/${tld}/cert.pem`
  }
}
const mockLocalCerts = [
  generateMockCert('example.com', true, 50),
  generateMockCert('woo.example.com', true, 60),
  generateMockCert('93million.com', false, 20),
  generateMockCert('foo.example.com', false, 10),
  generateMockCert('boo.example.com', false, 10, { skipAltNames: true })
]
const mockCertcacheCertDefinitions = [
  {
    certName: 'example.com',
    domains: ['example.com', 'www.example.com', 'test.example.com'],
    testCert: true
  },
  {
    certName: 'bar.example.com',
    domains: [
      'bar.example.com',
      'www.bar.example.com',
      'test.bar.example.com'
    ]
  },
  {
    certName: 'woo.example.com',
    domains: ['woo.example.com', 'foo.woo.example.com', 'test.woo.example.com'],
    testCert: true
  },
  {
    certName: 'boo.example.com',
    domains: ['boo.example.com', 'foo.boo.example.com', 'test.boo.example.com'],
    testCert: true
  }
]
mockLocalCerts.findCert = jest.fn()
let mockCertsForRenewal
let upstream

console.log = jest.fn()

getLocalCertificates.mockReturnValue(mockLocalCerts)

beforeAll(async () => {
  config = await getConfig()

  getConfig.mockReturnValue(Promise.resolve({
    ...config,
    certDir: certcacheCertDir,
    certs: mockCertcacheCertDefinitions
  }))

  upstream = canonicaliseUpstreamConfig(config.upstream)

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + config.renewalDays)

  const certDefCertNames = mockCertcacheCertDefinitions
    .map(({ certName }) => certName)
  mockCertsForRenewal = mockLocalCerts
    .filter(({ notAfter }) => (notAfter.getTime() < certRenewEpoch.getTime()))
    .filter(({ certPath }) => {
      const certDir = path.basename(path.dirname(certPath))

      return (certDefCertNames.includes(certDir) === false)
    })
})

test(
  'should renew certs using certs approaching expiry',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(obtainCert).toBeCalledWith(
        upstream.host,
        upstream.port,
        mockLocalCert.commonName,
        mockLocalCert.altNames,
        { certbot: { isTest: expect.any(Boolean) } },
        path.dirname(mockLocalCert.certPath),
        { cahKeysDir: config.cahKeysDir, days: config.renewalDays }
      )
    })
  }
)

test(
  'should throw error comprising all errors encountered calling obtainCert()',
  async () => {
    const err1 = new Error('failed 1')
    const err2 = new Error('failed 2')

    obtainCert.mockImplementationOnce(() => {
      throw err1
    })

    obtainCert.mockImplementationOnce(() => {
      throw err2
    })

    await expect(syncCerts())
      .rejects
      .toThrow([err1.message, err2.message].join('\n'))
  }
)

test(
  'should request a cert definition when no certificate exists',
  async () => {
    await syncCerts()

    const mockCert = mockCertcacheCertDefinitions.find(({ certName }) => {
      return (certName === 'bar.example.com')
    })

    expect(obtainCert).toBeCalledWith(
      upstream.host,
      upstream.port,
      mockCert.domains[0],
      mockCert.domains,
      expect.any(Object),
      path.resolve(certcacheCertDir, mockCert.certName),
      { cahKeysDir: config.cahKeysDir, days: config.renewalDays }
    )
  }
)

test(
  'should not request a cert definition when valid certificate exists',
  async () => {
    await syncCerts()

    const mockCert = mockCertcacheCertDefinitions.find(({ certName }) => {
      return (certName === 'example.com')
    })

    expect(obtainCert).not.toBeCalledWith(
      upstream.host,
      upstream.port,
      mockCert.domains[0],
      mockCert.domains,
      expect.any(Object),
      path.resolve(certcacheCertDir, mockCert.certName),
      { cahKeysDir: config.cahKeysDir, days: config.renewalDays }
    )
  }
)

test(
  'should request a cert definition when domains do not match certificate',
  async () => {
    await syncCerts()

    const mockCert = mockCertcacheCertDefinitions.find(({ certName }) => {
      return (certName === 'woo.example.com')
    })

    expect(obtainCert).toBeCalledWith(
      upstream.host,
      upstream.port,
      mockCert.domains[0],
      mockCert.domains,
      expect.any(Object),
      path.resolve(certcacheCertDir, mockCert.certName),
      { cahKeysDir: config.cahKeysDir, days: config.renewalDays }
    )
  }
)

test(
  // eslint-disable-next-line max-len
  'should not try and renew expiring certificate when domains do not match cert definition',
  async () => {
    await syncCerts()

    const mockCert = mockLocalCerts.find(({ commonName }) => {
      return (commonName === 'boo.example.com')
    })

    expect(obtainCert).not.toBeCalledWith(
      upstream.host,
      upstream.port,
      mockCert.commonName,
      mockCert.altNames,
      expect.any(Object),
      path.resolve(path.dirname(mockCert.certPath)),
      { cahKeysDir: config.cahKeysDir, days: config.renewalDays }
    )
  }
)
