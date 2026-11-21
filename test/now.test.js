let { test } = require('uvu')
let { equal, is, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = browserslist.data

function useDates() {
  browserslist.data = {
    chrome: {
      name: 'chrome',
      versions: ['1', '2', '3', '4'],
      released: ['1', '2', '3', '4'],
      releaseDate: {
        1: Date.parse('2019-01-01T00:00:00Z') / 1000,
        2: Date.parse('2019-07-01T00:00:00Z') / 1000,
        3: Date.parse('2020-01-01T00:00:00Z') / 1000,
        4: Date.parse('2020-07-01T00:00:00Z') / 1000
      }
    }
  }
}

test.after.each(() => {
  delete process.env.BROWSERSLIST_NOW
  browserslist.data = originData
  browserslist.clearCaches()
})

test('uses the reference date for last years queries', () => {
  useDates()
  process.env.BROWSERSLIST_NOW = '2020-01-01T00:00:00Z'
  equal(browserslist('last 1 year'), ['chrome 3', 'chrome 2', 'chrome 1'])
  equal(browserslist('last 0.5 years'), ['chrome 3'])
})

test('separates cached results by reference date', () => {
  useDates()
  process.env.BROWSERSLIST_NOW = '2020-01-01T00:00:00Z'
  let first = browserslist('last 1 year')
  process.env.BROWSERSLIST_NOW = '2021-01-01T00:00:00Z'
  equal(browserslist('last 1 year'), ['chrome 4'])
  process.env.BROWSERSLIST_NOW = '2019-12-31T19:00:00-05:00'
  is(browserslist('last 1 year'), first)
})

test('ends since queries at the reference date', () => {
  useDates()
  process.env.BROWSERSLIST_NOW = '2020-01-01T00:00:00Z'
  equal(browserslist('since 2019'), ['chrome 3', 'chrome 2', 'chrome 1'])
  equal(browserslist('since 2020-01-01'), ['chrome 3'])
  equal(browserslist('since 2020-02'), [])
})

test('restores the default clock and cache for empty or unset values', () => {
  let current = browserslist('last 1 year')
  process.env.BROWSERSLIST_NOW = '2020-01-01T00:00:00Z'
  browserslist('last 1 year')
  process.env.BROWSERSLIST_NOW = ''
  is(browserslist('last 1 year'), current)
  delete process.env.BROWSERSLIST_NOW
  is(browserslist('last 1 year'), current)
})

test('rejects invalid reference dates', () => {
  browserslist('last 1 year')
  process.env.BROWSERSLIST_NOW = 'not a date'
  throws(
    () => browserslist('last 1 year'),
    /BROWSERSLIST_NOW is not a valid date/
  )
})

test('accepts the Unix epoch as a reference date', () => {
  useDates()
  browserslist.data.chrome.releaseDate = { 1: -1, 2: 0, 3: 1, 4: null }
  process.env.BROWSERSLIST_NOW = '1970-01-01T00:00:00Z'
  equal(browserslist('last 1 year'), ['chrome 2', 'chrome 1'])
})

test('selects Node.js majors maintained at the reference date', () => {
  process.env.BROWSERSLIST_NOW = '2020-07-01T00:00:00Z'
  equal(
    browserslist('maintained node versions'),
    browserslist('node 10, node 12, node 14')
  )
  process.env.BROWSERSLIST_NOW = '2022-07-01T00:00:00Z'
  equal(
    browserslist('maintained node versions'),
    browserslist('node 14, node 16, node 18')
  )
})

test('uses the reference date for Baseline unless a date or year is given', () => {
  let explicitDate = browserslist('baseline widely available on 2022-01-01')
  let explicitYear = browserslist('baseline 2020')
  process.env.BROWSERSLIST_NOW = '2023-01-01T00:00:00Z'
  equal(
    browserslist('baseline widely available'),
    browserslist('baseline widely available on 2023-01-01')
  )
  equal(
    browserslist('baseline newly available'),
    browserslist('baseline widely available on 2025-07-01')
  )
  equal(browserslist('baseline widely available on 2022-01-01'), explicitDate)
  equal(browserslist('baseline 2020'), explicitYear)
})

test.run()
