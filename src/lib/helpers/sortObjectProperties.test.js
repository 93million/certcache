/* global test expect */

const sortObjectProperties = require('./sortObjectProperties')

test(
  'should sort object by properties alphabetically',
  () => {
    const unsorted = { foo: 123, bar: 321 }
    const expected = { bar: 321, foo: 123 }
    const sorted = sortObjectProperties(unsorted)

    expect(JSON.stringify(sorted)).toBe(JSON.stringify(expected))
  }
)

test(
  'should not mutate supplied objects',
  () => {
    const unsorted = { foo: 123, bar: 321 }
    const sorted = sortObjectProperties(unsorted)

    expect(JSON.stringify(sorted)).not.toBe(JSON.stringify(unsorted))
  }
)

test(
  'should not mutate supplied arrays',
  () => {
    const unsorted = [3, 2, 1]
    const sorted = sortObjectProperties(unsorted)

    expect(JSON.stringify(sorted)).not.toBe(JSON.stringify(unsorted))
  }
)

test(
  'should recursively sort structured objects',
  () => {
    const unsorted = { foo: 123, bar: { b: 321, a: 123 } }
    const expected = { bar: { a: 123, b: 321 }, foo: 123 }
    const sorted = sortObjectProperties(unsorted)

    expect(JSON.stringify(sorted)).toBe(JSON.stringify(expected))
  }
)

test(
  'should recursively sort structured arrays',
  () => {
    const unsorted = { foo: 123, bar: ['c', 'a', 'b'] }
    const expected = { bar: ['a', 'b', 'c'], foo: 123 }
    const sorted = sortObjectProperties(unsorted)

    expect(JSON.stringify(sorted)).toBe(JSON.stringify(expected))
  }
)

test(
  'should accept and sort arrays',
  () => {
    const unsorted = ['c', 'a', 'b']
    const expected = ['a', 'b', 'c']
    const sorted = sortObjectProperties(unsorted)

    expect(JSON.stringify(sorted)).toBe(JSON.stringify(expected))
  }
)
