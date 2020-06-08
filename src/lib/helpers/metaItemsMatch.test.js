/* global test expect */

const metaItemsMatch = require('./metaItemsMatch')

test(
  'should return true when meta items match',
  () => {
    const meta1 = { test: { item: 'foo', bar: 123 } }
    const meta2 = { test: { item: 'foo', bar: 123 } }

    expect(metaItemsMatch(meta1, meta2)).toBe(true)
  }
)

test(
  'should return true when meta items do not match',
  () => {
    const meta1 = { test: { item: 'foo', bar: 123 } }
    const meta2 = { test: { item: 'bar', bar: 321 } }

    expect(metaItemsMatch(meta1, meta2)).toBe(false)
  }
)
