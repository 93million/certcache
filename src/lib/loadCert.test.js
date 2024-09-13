/* global jest test expect */

const loadCert = require('./loadCert')
const tls = require('tls')

jest.mock('tls')
jest.mock('net')

const mockCert = 'mock_cert'
const getCertificate = jest.fn()

tls.TLSSocket.mockImplementation(() => ({ getCertificate }))

test(
  'should generate a certificate using tls.TLSSocket',
  () => {
    loadCert(mockCert)
    expect(getCertificate).toHaveBeenCalledTimes(1)
  }
)
