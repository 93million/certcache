const arrayItemsMatch = require('./arrayItemsMatch')

const srcList = ['93million.com', '93m.co.uk', 'www.93m.co.uk']

test(
  'should return true for matching items regardless of their order',
  () => {
    expect(arrayItemsMatch(
      srcList,
      ['www.93m.co.uk', '93million.com', '93m.co.uk']
    ))
      .toBe(true)
  }
)
test(
  'should return false when extra items are present',
  () => {
    expect(arrayItemsMatch(
      srcList,
      ['www.93m.co.uk', '93million.com', '93m.co.uk', 'bbc.co.uk']
    ))
      .toBe(false)
  }
)
test(
  'should return false when duplicate items present with missing item',
  () => {
    expect(arrayItemsMatch(
      srcList,
      ['www.93m.co.uk', '93m.co.uk', '93m.co.uk']
    ))
      .toBe(false)
  }
)
