/* global test expect */

const yaml = require('yaml')

const config = require('./config')
const file = { client: {}, server: {} }

test(
  'should parse yaml CERTCACHE_CERTS',
  () => {
    const mockCerts = { test: 'item', foo: 123 }
    const env = { CERTCACHE_CERTS: yaml.stringify(mockCerts) }

    expect(config({ argv: {}, env, file }).client.certs)
      .toEqual(mockCerts)
  }
)

test(
  'should parse yaml CERTCACHE_AUTH',
  () => {
    const mockAuth = { test: 'item', bar: 432 }
    const env = { CERTCACHE_AUTH: yaml.stringify(mockAuth) }

    expect(config({ argv: {}, env, file }).server.auth)
      .toEqual(mockAuth)
  }
)

test(
  'should parse yaml CERTCACHE_CLIENT_CERT_RESTRICTIONS',
  () => {
    const mockCertRestrictions = { test: 'item', bar: 432 }
    const env = {
      CERTCACHE_CLIENT_CERT_RESTRICTIONS: yaml.stringify(mockCertRestrictions)
    }

    expect(config({ argv: {}, env, file }).server.clientRestrictions)
      .toEqual(mockCertRestrictions)
  }
)
