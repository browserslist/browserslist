var browserslist = require('../')

var path = require('path')

var CUSTOM_STATS = path.join(__dirname, 'fixtures', 'stats.json')
beforeEach(() => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
})
afterEach(() => {
  delete process.env.BROWSERSLIST_STATS
})

it('adds at least one browser', () => {
  expect(browserslist('cover 1% of my stats')).toEqual(['ie 11'])
})

it('adds browsers by popularity', () => {
  expect(browserslist('cover 20% of my stats')).toEqual(
    ['chrome 37', 'chrome 36', 'ie 11', 'ie 10']
  )
})

it('does not add zero-popularity', () => {
  expect(browserslist('cover 20% of my stats', {
    stats: { ie: { '11': 10, '10': 0 } } })).toEqual(['ie 11'])
})

it('throws error on no stats', () => {
  delete process.env.BROWSERSLIST_STATS
  expect(function () {
    browserslist('cover 70% of my stats')
  }).toThrowError(/statistics was not provided/)
})
