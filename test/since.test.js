let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }
let originWarn = console.warn

test.before.each(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      versions: ['1', '2', '3'],
      released: [],
      releaseDate: {
        1: 0, // Thu, 01 Jan 1970 00:00:00 +0000
        2: 1483228800, // Sun, 01 Jan 2017 00:00:00 +0000
        3: 1485907200 // Wed, 01 Feb 2017 00:00:00 +0000
      }
    },
    safari: {
      name: 'safari',
      versions: ['TP'],
      released: [],
      releaseDate: {
        1: 1451606400, // Fri, 01 Jan 2016 00:00:00 +0000
        TP: null // unreleased
      }
    }
  }
  console.warn = function (...args) {
    if (args[0].includes('--update-db')) return
    originWarn.apply(this, args)
  }
})

test.after.each(() => {
  browserslist.data = originData
  console.warn = originWarn
})

test('selects versions released on year boundaries', () => {
  equal(browserslist('since 1970'), ['ie 3', 'ie 2', 'ie 1', 'safari 1'])
})

test('is case insensitive', () => {
  equal(browserslist('Since 1970'), ['ie 3', 'ie 2', 'ie 1', 'safari 1'])
})

test('selects versions released on year and month boundaries', () => {
  equal(browserslist('since 2017-01'), ['ie 3', 'ie 2'])
})

test('selects versions released on date boundaries', () => {
  equal(browserslist('since 2017-02-01'), ['ie 3'])
})

test.run()
