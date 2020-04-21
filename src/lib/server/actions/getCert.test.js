/* global jest test expect */

const getCert = require('./getCert')
const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const getExtensionsForDomains = require('../../getExtensionsForDomains')
const getConfig = require('../../getConfig')
const FeedbackError = require('../../FeedbackError')

jest.mock('../../classes/Certificate')
jest.mock('../../generateFirstCertInSequence')
jest.mock('../../clientPermittedAccessToCerts')
jest.mock('../../getExtensionsForDomains')
jest.mock('../../getConfig')

const domains = ['example.com', 'www.example.com', 'test.example.com']
const commonName = domains[0]
const altNames = [domains[0], ...domains.slice(1)]
const meta = { testExtension1: { isTest: false } }
const payload = { domains, meta }
const getLocalCerts = jest.fn()
const filterCertGetter = jest.fn()
const filterCert = jest.fn()
filterCertGetter.mockReturnValue(filterCert)

filterCert.mockReturnValue(true)

const getDate = (daysAway) => {
  const date = new Date()

  date.setDate(date.getDate() + daysAway)

  return date
}

const mockArchive = '__mockArchive__'

const getPeerCertificate = jest.fn()
getPeerCertificate.mockReturnValue({ subject: { CN: 'foo' } })
const req = { connection: { getPeerCertificate } }
const mockExtensions = [{
  filterCert: filterCertGetter,
  getLocalCerts,
  id: 'testExtension1'
}]

const mockCert = {
  getArchive: () => Promise.resolve(mockArchive),
  notAfter: getDate(90),
  altNames: ['example.com', 'www.example.com', 'test.example.com'],
  commonName: 'example.com',
  issuerCommonName: 'Super good issuer'
}

generateFirstCertInSequence.mockImplementation(() => {
  return Promise.resolve(mockCert)
})

getLocalCerts.mockReturnValue(Promise.resolve([mockCert]))
getExtensionsForDomains.mockReturnValue(Promise.resolve(mockExtensions))
clientPermittedAccessToCerts.mockReturnValue(true)

test(
  'should generate certificates when no matching local certificates are found',
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([]))

    await getCert(payload, { req })

    expect(generateFirstCertInSequence)
      .toBeCalledWith(expect.any(Array), commonName, altNames, meta)
  }
)

test(
  'should throw error when no cert can be generated',
  async () => {
    const err = new Error('Unable to generate cert')

    getLocalCerts.mockReturnValueOnce(Promise.resolve([]))
    generateFirstCertInSequence.mockImplementationOnce(() => {
      throw err
    })

    await expect(getCert(payload, { req })).rejects.toThrow(err)
  }
)

test(
  'should renew certificates close to expiry',
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([{
      ...mockCert,
      notAfter: getDate(1)
    }]))

    await getCert(payload, { req })

    expect(generateFirstCertInSequence)
      .toBeCalledWith(expect.any(Array), commonName, altNames, meta)
  }
)

test(
  'should not renew certificates far from expiry',
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([{
      ...mockCert,
      notAfter: getDate(90)
    }]))

    await getCert(payload, { req })

    expect(generateFirstCertInSequence).not.toBeCalled()
  }
)

test(
  'should throw error when client cannot access cert',
  async () => {
    getConfig.mockReturnValueOnce({ server: { clientRestrictions: [] } })

    clientPermittedAccessToCerts.mockReturnValueOnce(false)

    await expect(getCert(payload, { req }))
      .rejects
      .toThrow(
        'Client foo does not have permission to generate the requested certs'
      )
  }
)

test(
  [
    'should not throw error when CERTCACHE_CLIENT_CERT_RESTRICTIONS is set but',
    'client has permission'
  ].join(' '),
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

test(
  [
    'should locate the certificate with the longest expiry when multiple certs',
    'exist for domain'
  ].join(' '),
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([
      { ...mockCert, notAfter: getDate(10) },
      { ...mockCert, notAfter: getDate(40) },
      { ...mockCert,
        notAfter: getDate(90),
        getArchive: () => Promise.resolve('latest exrpiry cert')
      },
      { ...mockCert, notAfter: getDate(20) },
      { ...mockCert, notAfter: getDate(30) }
    ]))

    await expect(getCert(payload, { req })).resolves.toEqual({
      bundle: Buffer.from('latest exrpiry cert').toString('base64')
    })
  }
)

test(
  [
    'should throw a FeedbackError when no extension is able to locate or',
    'generate a cert for a domain'
  ].join(' '),
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([]))

    generateFirstCertInSequence.mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

    await expect(getCert(payload, { req }))
      .rejects
      .toThrow(
        new FeedbackError('Unable to find or generate requested certificate')
      )
  }
)

test(
  'should use extensions filterCert function to filter local certs',
  async () => {
    await getCert(payload, { req })

    expect(filterCertGetter).toBeCalledWith({
      commonName: mockCert.commonName,
      altNames: mockCert.altNames,
      meta: meta.testExtension1
    })
  }
)

test(
  'should work with extensions that do not provide a filterCert function',
  async () => {
    const {
      filterCert,
      ...mockExtensionWithoutFilterCert
    } = mockExtensions[0]

    getExtensionsForDomains.mockReturnValueOnce(Promise.resolve([
      { ...mockExtensionWithoutFilterCert }
    ]))

    const cert = await getCert(payload, { req })

    expect(filterCertGetter).not.toBeCalled()

    expect(cert).toEqual({
      bundle: Buffer.from(mockArchive).toString('base64')
    })
  }
)

test(
  [
    'should pass empty meta object to filterCert when no meta data present for',
    'extension'
  ].join(' '),
  async () => {
    await getCert({ ...payload, meta: {} }, { req })

    expect(filterCertGetter).toBeCalledWith({
      commonName: mockCert.commonName,
      altNames: mockCert.altNames,
      meta: {}
    })
  }
)

test(
  [
    'should match certs with only common name and no alt names when 1 domain',
    'provided'
  ].join(' '),
  async () => {
    generateFirstCertInSequence.mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

    getLocalCerts.mockReturnValueOnce(Promise.resolve([
      { ...mockCert, commonName: 'test.example.com', altNames: [] }
    ]))

    await expect(getCert(
      { ...payload, domains: ['test.example.com'] },
      { req }
    ))
      .resolves
      .toEqual({ bundle: Buffer.from(mockArchive).toString('base64') })
  }
)

test(
  [
    'should match certs with only common name and 1 alt name when 1 domain',
    'provided'
  ].join(' '),
  async () => {
    generateFirstCertInSequence.mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

    getLocalCerts.mockReturnValueOnce(Promise.resolve([
      {
        ...mockCert,
        commonName: 'test.example.com',
        altNames: ['test.example.com']
      }
    ]))

    await expect(getCert(
      { ...payload, domains: ['test.example.com'] },
      { req }
    ))
      .resolves
      .toEqual({ bundle: Buffer.from(mockArchive).toString('base64') })
  }
)
