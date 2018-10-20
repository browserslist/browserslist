var browserslist = require('../')

var path = require('path')
var fs = require('fs')

var CUSTOM_STATS = path.join(__dirname, 'fixtures', 'stats.json')
var ANDROID = path.join(__dirname, 'fixtures', 'android-stats.json')
var STATS = path.join(__dirname, 'fixtures', 'browserslist-stats.json')

afterEach(() => {
  delete process.env.BROWSERSLIST_STATS
})

it('throws error on invalid file', () => {
  expect(() => {
    browserslist('', { stats: 'no.json' })
  }).toThrowError('Can\'t read no.json')
})

it('takes stats file from environment variable', () => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  expect(browserslist('> 10% in my stats')).toEqual(['ie 11'])
})

it('takes stats by path', () => {
  expect(browserslist('> 10% in my stats', { stats: CUSTOM_STATS }))
    .toEqual(['ie 11'])
})

it('selects popularity by more or equal', () => {
  expect(browserslist('>= 5.3% in my stats', { stats: CUSTOM_STATS }))
    .toEqual(['ie 11', 'ie 10'])
})

it('selects browsers by unpopularity', () => {
  expect(browserslist('< 0.5% in my stats', { stats: CUSTOM_STATS }))
    .toEqual(['chrome 34', 'ie 8'])
})

it('selects unpopularity by less or equal', () => {
  expect(browserslist('<= 2.3% in my stats', { stats: CUSTOM_STATS }))
    .toEqual(['chrome 36', 'chrome 35', 'chrome 34', 'ie 9', 'ie 8'])
})

it('accepts non-space query', () => {
  expect(browserslist('>10% in my stats', { stats: CUSTOM_STATS }))
    .toEqual(['ie 11'])
})

it('takes stats from usage data object', () => {
  var data = JSON.parse(fs.readFileSync(CUSTOM_STATS))
  expect(browserslist('> 10% in my stats', { stats: data }))
    .toEqual(['ie 11'])
})

it('works alongside global usage query', () => {
  var list = browserslist('> 10% in my stats, > 1%', { stats: CUSTOM_STATS })
  expect(list.length > 1).toBeTruthy()
})

it('takes stats from browserslist-stats.json', () => {
  expect(browserslist('> 5% in my stats', { path: STATS })).toEqual(['ie 8'])
})

it('normalizes versions', () => {
  expect(
    browserslist(['> 3% in my stats', 'not and_chr > 0'], { stats: ANDROID })
  ).toEqual([])
})

it('throws error on no stats', () => {
  expect(function () {
    browserslist('> 5% in my stats')
  }).toThrowError(/statistics was not provided/)
})
