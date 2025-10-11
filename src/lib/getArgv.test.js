/* global test expect */

const { getArgv, setArgv } = require('./getArgv')

const mockArgv = { foo: 123 }

test('getArgv() should return value passed to setArgv()', () => {
  setArgv(mockArgv)

  expect(getArgv()).toStrictEqual(mockArgv)
})
