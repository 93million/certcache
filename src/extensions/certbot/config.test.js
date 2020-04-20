/* global test expect */

const yaml = require('yaml')

const config = require('./config')
const file = { extensions: {}, server: {} }

test(
  'should parse yaml CERTCACHE_CERTBOT_DOMAINS',
  () => {
    const mockDomains = { test: 'domain', bar: 432 }
    const env = { CERTCACHE_CERTBOT_DOMAINS: yaml.stringify(mockDomains) }

    expect(config({ argv: {}, env, file }).domains).toEqual(mockDomains)
  }
)
