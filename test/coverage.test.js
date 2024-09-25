let { join } = require('path')
let { test } = require('uvu')
let { equal, is, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let STATS = join(__dirname, 'fixtures', 'browserslist-stats.json')
let CUSTOM_STATS = join(__dirname, 'fixtures', 'stats.json')

let custom = {
  ie: {
    8: 3,
    9: 10
  }
}

let originUsage = browserslist.usage

test.before.each(() => {
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

test.after.each(() => {
  delete process.env.BROWSERSLIST_STATS
  browserslist.usage = originUsage
})

test('returns browsers coverage', () => {
  equal(browserslist.coverage(['ie 8', 'ie 9']), 15.1)
})

test('returns zero coverage on empty browsers', () => {
  equal(browserslist.coverage([]), 0)
})

test('returns zero coverage on missed data', () => {
  equal(browserslist.coverage(['ie 12']), 0)
})

test('returns usage in specified country', () => {
  equal(browserslist.coverage(['ie 9'], 'UK'), 4.4)
})

test('accepts country in any case', () => {
  equal(browserslist.coverage(['ie 9'], 'uk'), 4.4)
})

test('accepts mystats to load from custom stats', () => {
  process.env.BROWSERSLIST_STATS = STATS
  equal(browserslist.coverage(['ie 8'], 'my stats'), 6)
})

test('accepts mystats to load from custom stats with dataByBrowser', () => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  equal(browserslist.coverage(['ie 8'], 'my stats'), 0.1)
})

test('throws when no custom stats', () => {
  throws(
    () => browserslist.coverage(['ie 8'], 'my stats'),
    /statistics was not provided/
  )
})

test('loads country usage data from Can I Use', () => {
  is(browserslist.coverage(['ie 8', 'ie 9'], 'US') > 0, true)
})

test('loads continents usage data from Can I Use', () => {
  is(browserslist.coverage(['ie 8', 'ie 9'], 'alt-AS') > 0, true)
})

test('fixes statistics of 0 version', () => {
  is(browserslist.coverage(['ie 9'], 'RU'), 2)
})

test('fixes statistics of all version', () => {
  is(browserslist.coverage(['ie all'], 'RU'), 2)
})

test('supports custom statistics', () => {
  is(browserslist.coverage(['ie 9'], custom), 10)
  is(browserslist.coverage(['ie 9'], { dataByBrowser: custom }), 10)
})

test.run()
