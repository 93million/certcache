/* global jest */

const getArgv = jest.fn()
const setArgv = jest.fn()

getArgv.mockReturnValue({ foo: 123 })

module.exports = { getArgv, setArgv }
