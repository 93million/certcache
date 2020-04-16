/* global jest test expect */

const getCertGeneratorsForDomains = require('./getCertGeneratorsForDomains')
const getExtensions = require('./getExtensions')

jest.mock('./getConfig')

test(
  'should return a list of extensions that can generate certs for domains',
  async () => {
    const extensions = await getExtensions()

    const certGenerators = await getCertGeneratorsForDomains([
      'foo.example.com',
      'test.93million.com'
    ])

    expect(certGenerators.map(({ id }) => id)).toContain(extensions.certbot.id)
  }
)
