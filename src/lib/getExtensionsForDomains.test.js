/* global jest test expect */

const getExtensionsForDomains = require('./getExtensionsForDomains')
const getExtensions = require('./getExtensions')

jest.mock('./getConfig')
jest.mock('./getExtensions')

const canGenerateDomains = jest.fn()
const canNotGenerateDomains = jest.fn()

canGenerateDomains.mockReturnValue(Promise.resolve(true))
canNotGenerateDomains.mockReturnValue(Promise.resolve(false))

const mockExtensions = {
  ext1: { id: 'ext1', canGenerateDomains: canGenerateDomains },
  ext2: { id: 'ext2', canGenerateDomains: canNotGenerateDomains },
  ext3: { id: 'ext3' }
}

getExtensions.mockReturnValue(Promise.resolve(mockExtensions))

test(
  'should return a list of extensions that can generate certs for domains',
  async () => {
    const certGenerators = await getExtensionsForDomains([
      'foo.example.com',
      'test.93million.com'
    ])

    expect(certGenerators.map(({ id }) => id)).toEqual(['ext1', 'ext3'])
  }
)
