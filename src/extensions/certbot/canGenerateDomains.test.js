/* global jest test expect */

const canGenerateDomains = require('./canGenerateDomains')

jest.mock('../../lib/getConfig')

const mockDomains = ['test.93million.com', 'foo.example.com']

test(
  'should return true if every domain matches a domain listed in config',
  async () => {
    await expect(canGenerateDomains(mockDomains)).resolves.toBe(true)
  }
)

test(
  'should return false if every domain matches a domain listed in config',
  async () => {
    await expect(canGenerateDomains([
      ...mockDomains,
      'foo.93million.com'
    ])).resolves.toBe(false)
  }
)
