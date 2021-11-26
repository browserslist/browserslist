let { test } = require('uvu')
let { equal, is, throws, match } = require('uvu/assert')
let { readFile } = require('fs-extra')
let { join } = require('path')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }


let CUSTOM_STATS = join(__dirname, 'fixtures', 'stats.json')
let ANDROID = join(__dirname, 'fixtures', 'android-stats.json')
let STATS = join(__dirname, 'fixtures', 'browserslist-stats.json')

test.after.each(() => {
  delete process.env.BROWSERSLIST_STATS
  browserslist.data = originData
})

test('throws error on invalid file', () => {
  throws(() => browserslist('', { stats: 'no.json' }), "Can't read no.json")
})

test('takes stats file from environment variable', () => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  equal(browserslist('> 10% in my stats'), ['ie 11'])
})

test('takes stats by path', () => {
  equal(browserslist('> 10% in my stats', { stats: CUSTOM_STATS }), ['ie 11'])
})

test('selects popularity by more or equal', () => {
  equal(
    browserslist('>= 5.3% in my stats', { stats: CUSTOM_STATS }),
    ['ie 11', 'ie 10']
  )
})

test('selects browsers by unpopularity', () => {
  equal(
    browserslist('< 0.5% in my stats', { stats: CUSTOM_STATS }),
    ['chrome 34', 'ie 8']
  )
})

test('selects unpopularity by less or equal', () => {
  equal(
    browserslist('<= 2.3% in my stats', { stats: CUSTOM_STATS }),
    [
      'chrome 36',
      'chrome 35',
      'chrome 34',
      'ie 9',
      'ie 8'
    ]
  )
})

test('accepts non-space query', () => {
  equal(browserslist('>10% in my stats', { stats: CUSTOM_STATS }), ['ie 11'])
})

test('takes stats from usage data object', async () => {
  let data = JSON.parse((await readFile(CUSTOM_STATS)).toString())
  equal(browserslist('> 10% in my stats', { stats: data }), ['ie 11'])
})

test('works alongside global usage query', () => {
  let list = browserslist('> 10% in my stats, > 1%', { stats: CUSTOM_STATS })
  is(list.length > 1, true)
})

test('takes stats from browserslist-stats.json', () => {
  equal(browserslist('> 5% in my stats', { path: STATS }), ['ie 8'])
})

test('normalizes versions', () => {
  let opts = { stats: ANDROID }
  let last = browserslist(['last 1 and_chr version'], undefined, true)
  match(browserslist(['> 3% in my stats'], opts)[0], last[0])
  match(browserslist(['> 3% in my stats'], { ...opts, mobileToDesktop: true })[0], last[0])
  equal(browserslist(['> 3% in my stats', 'not and_chr > 0'], opts), [])
})

test('throws error on no stats', () => {
  throws(() => browserslist('> 5% in my stats'), /statistics was not provided/)
})

test.run()
