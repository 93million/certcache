/* global jest */

const getArgv = jest.fn()

getArgv.mockReturnValue({ foo: 123 })

module.exports = getArgv
