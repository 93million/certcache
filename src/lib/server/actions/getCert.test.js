/* global jest test expect beforeEach */

const getCert = require('./getCert')
const generators = require('../../../config/generators')
const locators = require('../../../config/locators')
const CertLocator = require('../../classes/CertLocator')
const CertGenerator = require('../../classes/CertGenerator')
const backends = require('../../../backends')
const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')

const domains = ['example.com', 'www.example.com', 'test.example.com']
const commonName = domains[0]
const altNames = [domains[0], ...domains.slice(1)]
const isTest = true
const payload = { domains, extras: { isTest } }
const getLocalCerts = jest.fn()
const findCert = jest.fn()
const extras = { isTest }
const date90DaysAway = new Date()
date90DaysAway.setDate(date90DaysAway.getDate() + 90)

const date1DayAway = new Date()
date1DayAway.setDate(date1DayAway.getDate() + 1)
const mockArchive = '__mockArchive__'

const mockCert = {
  getArchive: () => Promise.resolve(mockArchive),
  notAfter: date90DaysAway
}
const getPeerCertificate = jest.fn()
getPeerCertificate.mockReturnValue({ subject: { CN: 'foo' } })
const req = {
  connection: { getPeerCertificate }
}

beforeEach(() => {
  findCert.mockReset()
  findCert.mockReturnValue(mockCert)
  CertLocator.mockClear()
  CertGenerator.mockClear()
  generateFirstCertInSequence.mockReset()
  generateFirstCertInSequence.mockImplementation(() => {
    return Promise.resolve(mockCert)
  })
  clientPermittedAccessToCerts.mockClear()
  clientPermittedAccessToCerts.mockReturnValue(true)
})

getLocalCerts.mockReturnValue(Promise.resolve({ findCert }))

jest.mock('../../classes/CertGenerator')
jest.mock('../../classes/CertLocator')
jest.mock('../../classes/Certificate')
jest.mock('../../generateFirstCertInSequence')
jest.mock('../../clientPermittedAccessToCerts')

CertLocator.mockImplementation(() => ({ getLocalCerts }))
CertGenerator.mockImplementation(() => {})

test(
  'should load cert locators in order defined in config',
  async () => {
    await getCert(payload, { req })

    locators.forEach((key, i) => {
      expect(CertLocator.mock.calls[i][0]).toBe(backends[key])
    })
  }
)

test(
  'should load cert generators in order defined in config',
  async () => {
    await getCert(payload, { req })

    generators.forEach((key, i) => {
      expect(CertGenerator.mock.calls[0][i]).toBe(backends[key])
    })
  }
)

test(
  'should search for local certificates from data provided in payload',
  async () => {
    await getCert(payload, { req })

    expect(findCert).toBeCalledWith(commonName, altNames, extras)
  }
)

test(
  'when provided only 1 domain, should search for local certs using only common name when unable to find certs with matching alt names',
  async () => {
    const commonName = 'test.example.com'
    const payload = { domains: [commonName], extras: { isTest } }

    findCert.mockReset()
    findCert.mockReturnValue(undefined)

    await getCert(payload, { req })

    expect(findCert.mock.calls[0]).toEqual([commonName, [commonName], extras])
    expect(findCert.mock.calls[1]).toEqual([commonName, [], extras])
  }
)

test(
  'should generate certificates when no matching local certificates are found',
  async () => {
    findCert.mockReturnValue()

    await getCert(payload, { req })

    expect(generateFirstCertInSequence)
      .toBeCalledWith(
        expect.any(Array),
        commonName,
        altNames,
        extras,
        expect.any(Object)
      )
  }
)

test(
  'should throw error when no cert can be generated',
  () => {
    findCert.mockReturnValue()
    generateFirstCertInSequence.mockReturnValue()

    expect(getCert(payload, { req })).rejects.toThrow()
  }
)

test(
  'should renew certificates close to expiry',
  async () => {
    findCert.mockReturnValue({ ...mockCert, notAfter: date1DayAway })

    await getCert(payload, { req })

    expect(generateFirstCertInSequence)
      .toBeCalledWith(
        expect.any(Array),
        commonName,
        altNames,
        extras,
        expect.any(Object)
      )
  }
)

test(
  'should not renew certificates far from expiry',
  async () => {
    findCert.mockReturnValue({ ...mockCert, notAfter: date90DaysAway })

    await getCert(payload, { req })

    expect(generateFirstCertInSequence).not.toBeCalled()
  }
)

test(
  'should throw error when client cannot access cert',
  async () => {
    process.env.CERTCACHE_CLIENT_CERT_RESTRICTIONS = ''

    clientPermittedAccessToCerts.mockReturnValue(false)

    await expect(getCert(payload, { req }))
      .rejects
      .toThrow('Client foo does not have permission to generate the requested certs')
  }
)

test(
  'should not throw error when CERTCACHE_CLIENT_CERT_RESTRICTIONS is set but client has permission',
  async () => {
    process.env.CERTCACHE_CLIENT_CERT_RESTRICTIONS = ''

    await expect(getCert(payload, { req })).resolves.toEqual(expect.any(Object))
  }
)

test(
  'should resolve with certificate bundle',
  async () => {
    await expect(getCert(payload, { req })).resolves.toEqual({
      bundle: Buffer.from(mockArchive).toString('base64')
    })
  }
)
