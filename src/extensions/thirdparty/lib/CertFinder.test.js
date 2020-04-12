/* global jest test expect beforeEach */

const CertFinder = require('./CertFinder')
const readdirRecursive = require('./readdirRecursive')
const fileIsCert = require('./fileIsCert')
const fileIsKey = require('./fileIsKey')
const fs = require('fs')
const {
  Certificate: X509Certificate,
  PrivateKey,
  RSAPublicKey,
  RSAPrivateKey
} = require('@fidm/x509')

const certDir = '/test/cert/dir'
const certFinder = new CertFinder(certDir)
const pem = (type, contents) => [
  `-----BEGIN ${type}-----\n`,
  contents,
  `\n-----END ${type}-----\n`
].join('')
const dirContents = [
  {
    filename: 'cert1',
    contents: pem('CERTIFICATE', 'certcontents1'),
    type: 'cert',
    cert: {
      subject: { commonName: 'test.example.com' },
      dnsNames: ['test.example.com', 'test.93million.com', 'foo.example.com'],
      issuer: { commonName: '93Million Level 3 Authority' },
      publicKey: { toASN1: () => 'key2' }
    }
  },
  {
    filename: 'cert2',
    contents: pem('CERTIFICATE', 'certcontents2'),
    type: 'cert',
    cert: {
      subject: { commonName: '93Million Level 3 Authority' },
      issuer: { commonName: '93Million Root Authority' }
    }
  },
  {
    filename: 'cert3',
    contents: pem('CERTIFICATE', 'certcontents3'),
    type: 'cert',
    cert: {
      subject: { commonName: '93Million Root Authority' },
      issuer: { commonName: '93Million Root Authority' }
    }
  },
  {
    filename: 'cert4',
    contents: pem('CERTIFICATE', 'certcontents4'),
    type: 'cert',
    cert: {
      subject: { commonName: 'fee.example.com' },
      issuer: { commonName: '93Million Level 3 Authority' }
    }
  },
  {
    filename: 'key1',
    contents: pem('RSA PRIVATE KEY', 'keycontents1'),
    type: 'key'
  },
  {
    filename: 'key2',
    contents: pem('RSA PRIVATE KEY', 'keycontents2'),
    type: 'key'
  }
]

jest.mock('./readdirRecursive')
jest.mock('./fileIsCert')
jest.mock('./fileIsKey')
jest.mock('fs')
jest.mock('@fidm/x509')

readdirRecursive.mockImplementation(
  () => Promise.resolve(
    dirContents.map((item) => `${certDir}/${item.filename}`)
  )
)

fileIsCert.mockImplementation(
  (filename) => Promise.resolve((
    dirContents
      .find((item) => (
        `${certDir}/${item.filename}` === filename
      )).type === 'cert'
  ))
)

fileIsKey.mockImplementation(
  (filename) => Promise.resolve((
    dirContents
      .find((item) => (
        `${certDir}/${item.filename}` === filename
      )).type === 'key'
  ))
)

fs.readFile.mockImplementation((filename, callback) => {
  callback(
    null,
    dirContents
      .find((item) => (`${certDir}/${item.filename}` === filename))
      .contents
  )
})

X509Certificate.fromPEM.mockImplementation((pem) => {
  return {
    ...dirContents.find((item) => (item.contents === pem)).cert,
    isIssuer: () => true
  }
})

PrivateKey.fromPEM.mockImplementation((pem) => {
  const file = dirContents.find(({ contents }) => (contents === pem))

  return {
    toASN1: () => file.filename,
    keyPath: `${certDir}/${file.filename}`
  }
})

RSAPublicKey.mockImplementation((modulus) => ({ modulus }))
RSAPrivateKey.mockImplementation((modulus) => ({ modulus }))

const convertCertFileToExpected = (file) => ({
  ...file.cert,
  pem: file.contents,
  certPath: `${certDir}/${file.filename}`,
  isIssuer: expect.any(Function)
})

const convertKeyFileToExpected = (file) => ({
  toASN1: expect.any(Function),
  keyPath: `${certDir}/${file.filename}`
})

beforeEach(() => {
  readdirRecursive.mockClear()
})

test(
  'should find certificates with common name and no alt names',
  async () => {
    const search = { commonName: 'fee.example.com' }
    const expected = convertCertFileToExpected(dirContents.find((item) => (
      item.cert.subject.commonName === 'fee.example.com'
    )))

    await expect(certFinder.getCert(search))
      .resolves
      .toEqual(expected)
  }
)

test(
  'should find certificates with both common name and alt names',
  async () => {
    const search = {
      commonName: 'test.example.com',
      altNames: ['test.example.com', 'test.93million.com', 'foo.example.com']
    }
    const expected = convertCertFileToExpected(dirContents.find((item) => (
      item.cert.subject.commonName === 'test.example.com'
    )))

    await expect(certFinder.getCert(search))
      .resolves
      .toEqual(expected)
  }
)

test(
  'should optionally find certificate using issuer common name if provided',
  async () => {
    const successSearch = {
      commonName: 'test.example.com',
      altNames: ['test.example.com', 'test.93million.com', 'foo.example.com'],
      issuerCommonName: '93Million Level 3 Authority'
    }
    const failedSearch = {
      ...successSearch,
      issuerCommonName: 'Non existant CA'
    }
    const expected = convertCertFileToExpected(dirContents.find((item) => (
      item.cert.subject.commonName === 'test.example.com'
    )))

    await expect(certFinder.getCert(successSearch))
      .resolves
      .toEqual(expected)
    await expect(certFinder.getCert(failedSearch))
      .resolves
      .toBeUndefined()
  }
)

test(
  'should find the certificate authority that issued a certificate',
  async () => {
    const search = {
      subject: { commonName: 'test.example.com' },
      altNames: ['test.example.com', 'test.93million.com', 'foo.example.com'],
      issuer: { commonName: '93Million Level 3 Authority' },
      isIssuer: () => true
    }
    const expected = convertCertFileToExpected(dirContents.find((item) => (
      item.cert.subject.commonName === '93Million Level 3 Authority'
    )))

    await expect(certFinder.getIssuer(search))
      .resolves
      .toEqual(expected)
  }
)

test(
  'should find the chain of certificate authorities that issued a certificate',
  async () => {
    const search = {
      commonName: 'test.example.com',
      altNames: ['test.example.com', 'test.93million.com', 'foo.example.com'],
      issuerCommonName: '93Million Level 3 Authority'
    }
    const expected = [
      convertCertFileToExpected(dirContents.find((item) => (
        item.cert.subject.commonName === '93Million Level 3 Authority'
      ))),
      convertCertFileToExpected(dirContents.find((item) => (
        item.cert.subject.commonName === '93Million Root Authority'
      )))
    ]
    const cert = {
      ...await certFinder.getCert(search),
      isIssuer: () => true
    }

    await expect(certFinder.getChain(cert))
      .resolves
      .toEqual(expected)
  }
)

test(
  'should find the private key linked to a certificate',
  async () => {
    const search = {
      commonName: 'test.example.com',
      altNames: ['test.example.com', 'test.93million.com', 'foo.example.com']
    }
    const cert = await certFinder.getCert(search)
    const expected = convertKeyFileToExpected(dirContents.find((item) => (
      item.filename === 'key2'
    )))

    await expect(certFinder.getKey(cert))
      .resolves
      .toEqual(expected)
  }
)

test(
  'should find all the certificates within a specified directory',
  async () => {
    const expected = dirContents
      .filter(({ type }) => (type === 'cert'))
      .map(convertCertFileToExpected)

    await expect(certFinder.getCerts())
      .resolves
      .toEqual(expected)
  }
)

test(
  'should find all the keys within a specified directory',
  async () => {
    const expected = dirContents
      .filter(({ type }) => (type === 'key'))
      .map(convertKeyFileToExpected)

    await expect(certFinder.getKeys())
      .resolves
      .toEqual(expected)
  }
)

test(
  'should only load certs and keys once',
  async () => {
    const certFinder = new CertFinder(certDir)

    await certFinder.getKeys()
    await certFinder.getKeys()
    await certFinder.getCerts()
    await certFinder.getCerts()

    expect(readdirRecursive).toBeCalledTimes(1)
  }
)
