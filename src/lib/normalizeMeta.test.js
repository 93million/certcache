/* global jest test expect */

const normalizeMeta = require('./normalizeMeta')
const getExtensions = require('./getExtensions')

jest.mock('./getExtensions')

const mockExtensions = {
  ext1: {
    id: 'ext1',
    normalizeMeta: ({ item1, item3 }) => ({
      item1: item3,
      item2: item1
    })
  },
  ext3: {
    id: 'ext3',
    normalizeMeta: ({ item1, item2 }) => ({
      item1: item2,
      item3: item1
    })
  },
  extWithoutMeta: {
    id: 'ext4',
    normalizeMeta: jest.fn()
  }
}

const metaItem = {
  item1: 'item1',
  item2: 'item2',
  item3: 'item3',
  item4: 'item4'
}
const mockMeta = { ext1: metaItem, ext2: metaItem, ext3: metaItem }

getExtensions.mockReturnValue(mockExtensions)

test(
  'should replace items in extension that define normalizeMeta',
  async () => {
    await expect(normalizeMeta(mockMeta)).resolves.toMatchObject({
      ext1: {
        item1: 'item3',
        item2: 'item1'
      },
      ext3: {
        item1: 'item2',
        item3: 'item1'
      }
    })
  }
)

test(
  'should not replace items in extension that do not define normalizeMeta',
  async () => {
    await expect(normalizeMeta(mockMeta))
      .resolves
      .toHaveProperty('ext2', metaItem)
  }
)

test(
  // eslint-disable-next-line max-len
  'should call extension.normalizeMeta with empty object when no correspond object exists in meta',
  async () => {
    await normalizeMeta(mockMeta)
    expect(mockExtensions.extWithoutMeta.normalizeMeta).toBeCalledWith({})
  }
)

test(
  // eslint-disable-next-line max-len
  'should include objects returned from extension.normalizeMeta when no correspond object exists in meta',
  async () => {
    await normalizeMeta(mockMeta)
    expect(mockExtensions.extWithoutMeta.normalizeMeta).toBeCalledWith({})
  }
)
