/* global jest test expect */

const getCert = require('./getCert')
const generateFirstCertInSequence = require('../../generateFirstCertInSequence')
const clientPermittedAccessToCerts =
  require('../../clientPermittedAccessToCerts')
const getExtensionsForDomains = require('../../getExtensionsForDomains')
const getConfig = require('../../getConfig')
const FeedbackError = require('../../FeedbackError')
const metaItemsMatch = require('../../helpers/metaItemsMatch')

jest.mock('../../classes/Certificate')
jest.mock('../../generateFirstCertInSequence')
jest.mock('../../clientPermittedAccessToCerts')
jest.mock('../../getExtensionsForDomains')
jest.mock('../../getConfig')
jest.mock('../../helpers/metaItemsMatch')

const domains = ['example.com', 'www.example.com', 'test.example.com']
const commonName = domains[0]
const altNames = [domains[0], ...domains.slice(1)]
const meta = { testExtension1: { isTest: false } }
const payload = { domains, meta }
const getLocalCerts = jest.fn()
metaItemsMatch.mockReturnValue(true)

const getDate = (daysAway) => {
  const date = new Date()

  date.setDate(date.getDate() + daysAway)

  return date
}

const mockArchive = '__mockArchive__'

const getPeerCertificate = jest.fn()
getPeerCertificate.mockReturnValue({ subject: { CN: 'foo' } })
const clientName = 'mockClient'
const mockExtensions = [{
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

    await getCert(payload, { clientName })

    expect(generateFirstCertInSequence).toBeCalledWith(
      expect.any(Array),
      commonName,
      altNames,
      expect.objectContaining(meta)
    )
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

    await expect(getCert(payload, { clientName })).rejects.toThrow(err)
  }
)

test(
  'should renew certificates close to expiry',
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([{
      ...mockCert,
      notAfter: getDate(1)
    }]))

    await getCert(payload, { clientName })

    expect(generateFirstCertInSequence).toBeCalledWith(
      expect.any(Array),
      commonName,
      altNames,
      expect.objectContaining(meta)
    )
  }
)

test(
  'should not renew certificates far from expiry',
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([{
      ...mockCert,
      notAfter: getDate(90)
    }]))

    await getCert(payload, { clientName })

    expect(generateFirstCertInSequence).not.toBeCalled()
  }
)

test(
  'should throw error when client cannot access cert',
  async () => {
    getConfig.mockReturnValueOnce({ server: { domainAccess: [] } })

    clientPermittedAccessToCerts.mockReturnValueOnce(false)

    await expect(getCert(payload, { clientName }))
      .rejects
      .toThrow([
        'Client',
        clientName,
        'does not have permission to generate the requested certs'
      ].join(' '))
  }
)

test(
  // eslint-disable-next-line max-len
  'should not throw error when CERTCACHE_DOMAIN_ACCESS is set but client has permission',
  async () => {
    process.env.CERTCACHE_DOMAIN_ACCESS = ''

    await expect(getCert(payload, { clientName }))
      .resolves
      .toEqual(expect.any(Object))
  }
)

test(
  'should resolve with certificate bundle',
  async () => {
    await expect(getCert(payload, { clientName })).resolves.toEqual({
      bundle: Buffer.from(mockArchive).toString('base64')
    })
  }
)

test(
  // eslint-disable-next-line max-len
  'should locate the certificate with the longest expiry when multiple certs exist for domain',
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

    await expect(getCert(payload, { clientName })).resolves.toEqual({
      bundle: Buffer.from('latest exrpiry cert').toString('base64')
    })
  }
)

test(
  // eslint-disable-next-line max-len
  'should throw a FeedbackError when no extension is able to locate or generate a cert for a domain',
  async () => {
    getLocalCerts.mockReturnValueOnce(Promise.resolve([]))

    generateFirstCertInSequence.mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

    await expect(getCert(payload, { clientName }))
      .rejects
      .toThrow(
        new FeedbackError('Unable to find or generate requested certificate')
      )
  }
)

test(
  // eslint-disable-next-line max-len
  'should match certs with only common name and no alt names when 1 domain provided',
  async () => {
    generateFirstCertInSequence.mockImplementationOnce(() => {
      return Promise.resolve(undefined)
    })

    getLocalCerts.mockReturnValueOnce(Promise.resolve([
      { ...mockCert, commonName: 'test.example.com', altNames: [] }
    ]))

    await expect(getCert(
      { ...payload, domains: ['test.example.com'] },
      { clientName }
    ))
      .resolves
      .toEqual({ bundle: Buffer.from(mockArchive).toString('base64') })
  }
)

test(
  // eslint-disable-next-line max-len
  'should match certs with only common name and 1 alt name when 1 domain provided',
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
      { clientName }
    ))
      .resolves
      .toEqual({ bundle: Buffer.from(mockArchive).toString('base64') })
  }
)

test(
  'should not perform restriction checks when client name not provided',
  async () => {
    await getCert(payload)

    expect(clientPermittedAccessToCerts).not.toBeCalled()
  }
)
