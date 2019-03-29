var path = require('path')

var browserslist = require('../')

var CUSTOM_STATS = path.join(__dirname, 'fixtures', 'stats.json')

var originUsage = browserslist.usage

beforeEach(() => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  browserslist.usage = {
    global: {
      'ie 5': 50,
      'ie 11': 10
    },
    US: {
      'ie 8': 2,
      'ie 9': 4.4
    },
    'alt-us': {
      'ie 8': 25,
      'ie 9': 10
    }
  }
})
afterEach(() => {
  delete process.env.BROWSERSLIST_STATS
  browserslist.usage = originUsage
})

it('adds at least one browser', () => {
  expect(browserslist('cover 1% in my stats')).toEqual(['ie 11'])
})

it('global coverage', () => {
  expect(browserslist('cover 0.1%')).toEqual(['ie 5'])
})

it('country coverage', () => {
  expect(browserslist('cover 0.1% in US')).toEqual(['ie 9'])
})

it('country coverage alt', () => {
  expect(browserslist('cover 0.1% in alt-us')).toEqual(['ie 8'])
})

it('adds browsers by popularity', () => {
  expect(browserslist('cover 20% in my stats')).toEqual(
    ['chrome 37', 'chrome 36', 'ie 11', 'ie 10']
  )
})

it('does not add zero-popularity', () => {
  expect(browserslist('cover 20% in my stats', {
    stats: { ie: { '11': 10, '10': 0 } } })).toEqual(['ie 11'])
})

it('throws error on no stats', () => {
  delete process.env.BROWSERSLIST_STATS
  expect(function () {
    browserslist('cover 70% in my stats')
  }).toThrowError(/statistics was not provided/)
})
