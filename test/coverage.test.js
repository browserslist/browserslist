var path = require('path')

var browserslist = require('../')

var STATS = path.join(__dirname, 'fixtures', 'browserslist-stats.json')
var CUSTOM_STATS = path.join(__dirname, 'fixtures', 'stats.json')

var custom = {
  ie: {
    8: 3,
    9: 10
  }
}

var originUsage = browserslist.usage

beforeEach(() => {
  browserslist.usage = {
    global: {
      'ie 8': 5,
      'ie 9': 10.1
    },
    UK: {
      'ie 8': 2,
      'ie 9': 4.4
    },
    RU: {
      'ie 0': 2
    }
  }
})

afterEach(() => {
  delete process.env.BROWSERSLIST_STATS
  browserslist.usage = originUsage
})

it('returns browsers coverage', () => {
  expect(browserslist.coverage(['ie 8', 'ie 9'])).toEqual(15.1)
})

it('returns zero coverage on empty browsers', () => {
  expect(browserslist.coverage([])).toEqual(0)
})

it('returns zero coverage on missed data', () => {
  expect(browserslist.coverage(['ie 12'])).toEqual(0)
})

it('returns usage in specified country', () => {
  expect(browserslist.coverage(['ie 9'], 'UK')).toEqual(4.4)
})

it('accepts country in any case', () => {
  expect(browserslist.coverage(['ie 9'], 'uk')).toEqual(4.4)
})

it('accepts mystats to load from custom stats', () => {
  process.env.BROWSERSLIST_STATS = STATS
  expect(browserslist.coverage(['ie 8'], 'my stats')).toEqual(6)
})

it('accepts mystats to load from custom stats with dataByBrowser', () => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  expect(browserslist.coverage(['ie 8'], 'my stats')).toEqual(0.1)
})

it('throws when no custom stats', () => {
  expect(function () {
    browserslist.coverage(['ie 8'], 'my stats')
  }).toThrowError(/statistics was not provided/)
})

it('loads country usage data from Can I Use', () => {
  expect(browserslist.coverage(['ie 8', 'ie 9'], 'US') > 0).toBeTruthy()
})

it('loads continents usage data from Can I Use', () => {
  expect(browserslist.coverage(['ie 8', 'ie 9'], 'alt-AS') > 0).toBeTruthy()
})

it('fixes statistics of 0 version', () => {
  expect(browserslist.coverage(['ie 9'], 'RU')).toEqual(2)
})

it('fixes statistics of all version', () => {
  expect(browserslist.coverage(['ie all'], 'RU')).toEqual(2)
})

it('supports custom statistics', () => {
  expect(browserslist.coverage(['ie 9'], custom)).toEqual(10)
  expect(browserslist.coverage(['ie 9'], { dataByBrowser: custom })).toEqual(10)
})
