/* global jest test expect beforeEach */

const getCert = require('./getCert')
const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const getCertLocators = require('../../getCertLocators')
const getCertGeneratorsForDomains = require('../../getCertGeneratorsForDomains')

const domains = ['example.com', 'www.example.com', 'test.example.com']
const commonName = domains[0]
const altNames = [domains[0], ...domains.slice(1)]
const isTest = false
const payload = { domains, isTest }
const getLocalCerts = jest.fn()
const findCert = jest.fn()
const date90DaysAway = new Date()
date90DaysAway.setDate(date90DaysAway.getDate() + 90)

const date1DayAway = new Date()
date1DayAway.setDate(date1DayAway.getDate() + 1)
const mockArchive = '__mockArchive__'

let mockCert
const getPeerCertificate = jest.fn()
getPeerCertificate.mockReturnValue({ subject: { CN: 'foo' } })
const req = {
  connection: { getPeerCertificate }
}
const mockCertLocators = [{ getLocalCerts }]

beforeEach(() => {
  mockCert = {
    getArchive: () => Promise.resolve(mockArchive),
    notAfter: date90DaysAway,
    altNames: ['example.com', 'www.example.com', 'test.example.com'],
    commonName: 'example.com',
    issuerCommonName: 'Super good issuer'
  }
  generateFirstCertInSequence.mockReset()
  generateFirstCertInSequence.mockImplementation(() => {
    return Promise.resolve(mockCert)
  })
  clientPermittedAccessToCerts.mockClear()
  clientPermittedAccessToCerts.mockReturnValue(true)
  getCertLocators.mockReset()
  getCertLocators.mockReturnValue(Promise.resolve(mockCertLocators))
  getCertGeneratorsForDomains.mockReset()
  getCertGeneratorsForDomains.mockReturnValue(Promise.resolve([]))
  getLocalCerts.mockReset()
  getLocalCerts.mockReturnValue(Promise.resolve([mockCert]))
})

getLocalCerts.mockReturnValue(Promise.resolve({ findCert }))

jest.mock('../../classes/Certificate')
jest.mock('../../generateFirstCertInSequence')
jest.mock('../../clientPermittedAccessToCerts')
jest.mock('../../getCertLocators')
jest.mock('../../getCertGeneratorsForDomains')

test.skip(
  'should load cert generators in order defined in config',
  async () => {
    await getCert(payload, { req })
  }
)

test.skip(
  'should search for local certificates from data provided in payload',
  async () => {
    await getCert(payload, { req })

    expect(findCert).toBeCalledWith(commonName, altNames, { isTest })
  }
)

test.skip(
  'when provided only 1 domain, should search for local certs using only common name when unable to find certs with matching alt names',
  async () => {
    const commonName = 'test.example.com'
    const payload = { domains: [commonName], isTest }

    findCert.mockReset()
    findCert.mockReturnValue(undefined)

    await getCert(payload, { req })

    expect(findCert.mock.calls[0]).toEqual([commonName, [commonName], { isTest }])
    expect(findCert.mock.calls[1]).toEqual([commonName, [], { isTest }])
  }
)

test(
  'should generate certificates when no matching local certificates are found',
  async () => {
    getLocalCerts.mockReset()
    getLocalCerts.mockReturnValue(Promise.resolve([]))

    await getCert(payload, { req })

    expect(generateFirstCertInSequence)
      .toBeCalledWith(expect.any(Array), commonName, altNames, { isTest })
  }
)

test(
  'should throw error when no cert can be generated',
  async () => {
    getLocalCerts.mockReset()
    getLocalCerts.mockReturnValue(Promise.resolve([]))
    generateFirstCertInSequence.mockReset()
    generateFirstCertInSequence.mockImplementation(() => {
      throw new Error('Unable to generate cert')
    })

    await expect(getCert(payload, { req })).rejects.toThrow()
  }
)

test(
  'should renew certificates close to expiry',
  async () => {
    getLocalCerts.mockReset()
    getLocalCerts.mockReturnValue(Promise.resolve([{
      ...mockCert,
      notAfter: date1DayAway
    }]))

    await getCert(payload, { req })

    expect(generateFirstCertInSequence)
      .toBeCalledWith(
        expect.any(Array),
        commonName,
        altNames,
        { isTest }
      )
  }
)

test(
  'should not renew certificates far from expiry',
  async () => {
    mockCert = { ...mockCert, notAfter: date90DaysAway }

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
