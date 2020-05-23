/* global test expect */

const canonicaliseUpstreamConfig = require('./canonicaliseUpstreamConfig')

test(
  'should accept a string representing hostname',
  () => {
    expect(canonicaliseUpstreamConfig('certcache1.example.com'))
      .toMatchObject({ host: 'certcache1.example.com' })
  }
)

test(
  'should parse port number from hostname',
  () => {
    expect(canonicaliseUpstreamConfig('certcache1.example.com:9876'))
      .toMatchObject({ host: 'certcache1.example.com', port: 9876 })
  }
)

test(
  'should accept an objects representing hostname',
  () => {
    expect(canonicaliseUpstreamConfig({ host: 'certcache1.example.com' }))
      .toMatchObject({ host: 'certcache1.example.com' })
  }
)

test(
  'should return a default port when none present',
  () => {
    expect(canonicaliseUpstreamConfig('certcache1.example.com'))
      .toMatchObject({ host: 'certcache1.example.com', port: 4433 })
  }
)

test(
  'should not overwrite existing port when present',
  () => {
    expect(canonicaliseUpstreamConfig({
      host: 'certcache1.example.com',
      port: 2345
    }))
      .toMatchObject({ host: 'certcache1.example.com', port: 2345 })
  }
)
