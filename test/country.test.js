let browserslist = require('../')

let originUsage = browserslist.usage

beforeEach(() => {
  browserslist.usage = {
    US: {
      'ie 8': 1,
      'ie 9': 5,
      'ie 10': 10.1,
      'ie 11': 75
    }
  }
})

afterEach(() => {
  browserslist.usage = originUsage
})

it('selects browsers by popularity', () => {
  expect(browserslist('> 10% in US')).toEqual(['ie 11', 'ie 10'])
})

it('selects popularity by more or equal', () => {
  expect(browserslist('>= 5% in US')).toEqual(['ie 11', 'ie 10', 'ie 9'])
})

it('selects browsers by unpopularity', () => {
  expect(browserslist('< 5% in US')).toEqual(['ie 8'])
})

it('selects unpopularity by less or equal', () => {
  expect(browserslist('<= 5% in US')).toEqual(['ie 9', 'ie 8'])
})

it('works with float', () => {
  expect(browserslist('> 10.2% in US')).toEqual(['ie 11'])
})

it('works with float that has a leading dot', () => {
  expect(browserslist('> .2% in US')).toEqual(
    ['ie 11', 'ie 10', 'ie 9', 'ie 8']
  )
})

it('fixes country case', () => {
  expect(browserslist('> 10.2% in us')).toEqual(['ie 11'])
})

it('loads country from Can I Use', () => {
  expect(browserslist('> 1% in RU').length > 0).toBe(true)
})

it('loads continents from Can I Use', () => {
  expect(browserslist('> 1% in alt-AS').length > 0).toBe(true)
})

it('allows omission of the space between the > and the percentage', () => {
  expect(browserslist('>10% in US').length > 0).toBe(true)
})
