let { test } = require('uvu')
let { equal, throws } = require('uvu/assert')
let { join } = require('path')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let CUSTOM_STATS = join(__dirname, 'fixtures', 'stats.json')

let originUsage = browserslist.usage

test.before.each(() => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  browserslist.usage = {
    'global': {
      'ie 5': 50,
      'ie 11': 10
    },
    'US': {
      'ie 8': 2,
      'ie 9': 4.4
    },
    'alt-us': {
      'ie 8': 25,
      'ie 9': 10
    }
  }
})
test.after.each(() => {
  delete process.env.BROWSERSLIST_STATS
  browserslist.usage = originUsage
})

test('adds at least one browser', () => {
  equal(browserslist('cover 1% in my stats'), ['ie 11'])
})

test('is case insensitive for custom stat', () => {
  equal(browserslist('Cover 1% In My Stats'), ['ie 11'])
})

test('global coverage', () => {
  equal(browserslist('cover 0.1%'), ['ie 5'])
})

test('is case insensitive for global coverage', () => {
  equal(browserslist('Cover 0.1%'), ['ie 5'])
})

test('country coverage', () => {
  equal(browserslist('cover 0.1% in US'), ['ie 9'])
})

test('country coverage alt', () => {
  equal(browserslist('cover 0.1% in alt-us'), ['ie 8'])
})

test('is case insensitive for country coverage', () => {
  equal(browserslist('Cover 0.1% in us'), ['ie 9'])
  equal(browserslist('Cover 0.1% in Alt-US'), ['ie 8'])
})

test('adds browsers by popularity', () => {
  equal(browserslist('cover 20% in my stats'), [
    'chrome 37',
    'chrome 36',
    'ie 11',
    'ie 10'
  ])
})

test('does not add zero-popularity', () => {
  let stats = { stats: { ie: { 11: 10, 10: 0 } } }
  equal(browserslist('cover 20% in my stats', stats), ['ie 11'])
})

test('throws error on no stats', () => {
  delete process.env.BROWSERSLIST_STATS
  throws(
    () => browserslist('cover 70% in my stats'),
    /statistics was not provided/
  )
})

test.run()
