/* global test expect */
const filterCert = require('./filterCert')

const mockTestCert = { issuerCommonName: 'Fake LE Intermediate X1' }
const realTestCert = { issuerCommonName: 'Let\'s Encrypt Authority X3' }
const mockTestMeta = { isTest: true }
const mockRealMeta = { isTest: false }

test(
  'filter function should match test certs',
  () => {
    const filterFn = filterCert({ meta: mockTestMeta })

    expect(filterFn(mockTestCert)).toBe(true)
    expect(filterFn(realTestCert)).toBe(false)
  }
)

test(
  'filter function should match real certs',
  () => {
    const filterFn = filterCert({ meta: mockRealMeta })

    expect(filterFn(mockTestCert)).toBe(false)
    expect(filterFn(realTestCert)).toBe(true)
  }
)
