const getCert = require('./getCert')
const generators = require('../../../config/generators')
const locators = require('../../../config/locators')
const CertLocator = require('../../classes/CertLocator')
const CertGenerator = require('../../classes/CertGenerator')
const backends = require('../../plugins')
const generateFirstCertInSequence = require(
  '../../generateFirstCertInSequence'
)

const domains = ['example.com', 'www.example.com', 'test.example.com']
const commonName = domains[0]
const altNames = [...domains.slice(1), domains[0]]
const isTest = true
const payload = {domains, isTest}
const getLocalCerts = jest.fn()
const findCert = jest.fn()
const extras = {isTest}
const mockCert = { getArchive: () => Promise.resolve('done') }

beforeEach(() => {
  findCert.mockReset()
  findCert.mockReturnValue(mockCert)
  CertLocator.mockClear()
  CertGenerator.mockClear()
  generateFirstCertInSequence.mockImplementation(() => {
    return Promise.resolve(mockCert)
  })
})

getLocalCerts.mockReturnValue(Promise.resolve({findCert}))

jest.mock('../../classes/CertGenerator')
jest.mock('../../classes/CertLocator')
jest.mock('../../classes/Certificate')
jest.mock('../../generateFirstCertInSequence')

CertLocator.mockImplementation(() => ({getLocalCerts}))
CertGenerator.mockImplementation(() => {})

test(
  'should load cert locators in order defined in config',
  async () => {
    await getCert(payload)

    locators.forEach((key, i) => {
      expect(CertLocator.mock.calls[0][i]).toBe(backends[key])
    })
  }
)

test(
  'should load cert generators in order defined in config',
  async () => {
    await getCert(payload)

    generators.forEach((key, i) => {
      expect(CertGenerator.mock.calls[0][i]).toBe(backends[key])
    })
  }
)

test(
  'should search for local certificates from data provided in payload',
  async () => {
    await getCert(payload)

    expect(findCert)
      .toBeCalledWith(commonName, altNames, extras)
  }
)

test(
  'should generate certificates when no matching local certificates are found',
  async () => {
    findCert.mockReturnValue()

    await getCert(payload)

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

    expect(getCert(payload)).rejects.toThrow()
  }
)
