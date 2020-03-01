/* global jest test expect beforeEach */

const CertGenerator = require('./CertGenerator')
const Certificate = require('./Certificate')

const handlers = {
  generateCert: jest.fn()
}
const commonName = 'test.example.com'
const altNames = ['test.example.com', 'foo.test.com']
const isTest = false
const config = { testConfigItem: '/test/config/item' }
const certGenerator = new CertGenerator(handlers)

jest.mock('../getCertInfo')

beforeEach(() => {
  handlers.generateCert.mockClear()
})

test(
  'should call generate cert from handlers',
  async () => {
    await certGenerator.generateCert(commonName, altNames, { isTest }, config)

    expect(handlers.generateCert).toBeCalledWith(
      commonName, altNames, { isTest }, config
    )
  }
)

test(
  'should return an instance of Certificate class',
  async () => {
    const cert = await certGenerator
      .generateCert(commonName, altNames, { isTest }, config)

    expect(cert).toBeInstanceOf(Certificate)
  }
)
