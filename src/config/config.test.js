/* global test expect */

const yaml = require('yaml')

const config = require('./config')
const file = { extensions: {}, server: {} }

test(
  'should parse yaml CERTCACHE_CERTS',
  async () => {
    const mockCerts = { test: 'item', foo: 123 }
    const env = { CERTCACHE_CERTS: yaml.stringify(mockCerts) }

    await expect(config({ argv: {}, env, file }))
      .resolves
      .toMatchObject({ certs: mockCerts })
  }
)

test(
  'should parse yaml CERTCACHE_DOMAIN_ACCESS',
  async () => {
    const mockCertRestrictions = { test: 'item', bar: 432 }
    const env = {
      CERTCACHE_DOMAIN_ACCESS: yaml.stringify(mockCertRestrictions)
    }

    await expect(config({ argv: {}, env, file }))
      .resolves
      .toMatchObject({ server: { domainAccess: mockCertRestrictions } })
  }
)

test(
  'should return renewalDays as a number',
  async () => {
    const renewalDays = 58008
    const env = { CERTCACHE_DAYS_RENEWAL: String(renewalDays) }
    const argv = { days: String(renewalDays) }

    await expect(config({ argv, env: {}, file }))
      .resolves
      .toMatchObject({ renewalDays })
    await expect(config({ argv: {}, env, file }))
      .resolves
      .toMatchObject({ renewalDays })
  }
)

test(
  'should return maxRequestTime as a number',
  async () => {
    const maxRequestTime = 58008
    const env = { CERTCACHE_MAX_REQUEST_TIME: String(maxRequestTime) }
    const argv = { 'max-request-time': String(maxRequestTime) }

    await expect(config({ argv, env: {}, file }))
      .resolves
      .toMatchObject({ maxRequestTime })
    await expect(config({ argv: {}, env, file }))
      .resolves
      .toMatchObject({ maxRequestTime })
  }
)
