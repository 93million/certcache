/* global test expect */

const normaliseUpstreamConfig = require('./normaliseUpstreamConfig')

test(
  'should accept a string representing hostname',
  () => {
    expect(normaliseUpstreamConfig('certcache1.example.com'))
      .toMatchObject({ host: 'certcache1.example.com' })
  }
)

test(
  'should parse port number from hostname',
  () => {
    expect(normaliseUpstreamConfig('certcache1.example.com:9876'))
      .toMatchObject({ host: 'certcache1.example.com', port: 9876 })
  }
)

test(
  'should accept an objects representing hostname',
  () => {
    expect(normaliseUpstreamConfig({ host: 'certcache1.example.com' }))
      .toMatchObject({ host: 'certcache1.example.com' })
  }
)

test(
  'should return a default port when none present',
  () => {
    expect(normaliseUpstreamConfig('certcache1.example.com'))
      .toMatchObject({ host: 'certcache1.example.com', port: 4433 })
  }
)

test(
  'should not overwrite existing port when present',
  () => {
    expect(normaliseUpstreamConfig({
      host: 'certcache1.example.com',
      port: 2345
    }))
      .toMatchObject({ host: 'certcache1.example.com', port: 2345 })
  }
)
