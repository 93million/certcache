/* global test expect */

const yaml = require('yaml')

const config = require('./config')
const file = { extensions: {}, server: {} }

test(
  'should parse yaml CERTCACHE_CERTS',
  () => {
    const mockCerts = { test: 'item', foo: 123 }
    const env = { CERTCACHE_CERTS: yaml.stringify(mockCerts) }

    expect(config({ argv: {}, env, file }).certs)
      .toEqual(mockCerts)
  }
)

test(
  'should parse yaml CERTCACHE_CLIENT_CERT_RESTRICTIONS',
  () => {
    const mockCertRestrictions = { test: 'item', bar: 432 }
    const env = {
      CERTCACHE_CLIENT_CERT_RESTRICTIONS: yaml.stringify(mockCertRestrictions)
    }

    expect(config({ argv: {}, env, file }).server.domainAccess)
      .toEqual(mockCertRestrictions)
  }
)

test(
  'should return renewalDays as a number',
  () => {
    const renewalDays = 58008
    const env = { CERTCACHE_DAYS_RENEWAL: String(renewalDays) }
    const argv = { days: String(renewalDays) }

    expect(config({ argv, env: {}, file })).toMatchObject({ renewalDays })
    expect(config({ argv: {}, env, file })).toMatchObject({ renewalDays })
  }
)
