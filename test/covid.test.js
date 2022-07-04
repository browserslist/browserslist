let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }
let originWarn = console.warn

test.before.each(() => {
  browserslist.data = {
    chrome: {
      name: 'chrome',
      versions: ['1', '2', '3'],
      released: [],
      releaseDate: {
        1: 0, // 01 Jan 1970 00:00:00 +0000
        2: 1485907200, // 01 Feb 2017 00:00:00 +0000
        3: 1609459200 // 01 Jan 2021 00:00:00 +0000
      }
    },
    safari: {
      name: 'safari',
      versions: ['TP'],
      released: [],
      releaseDate: {
        1: 1575244800, // 02 Dec 2019 00:00:00 +0000
        TP: null // unreleased
      }
    }
  }
  console.warn = function (...args) {
    if (args[0].includes('update-browserslist-db')) return
    originWarn.apply(this, args)
  }
})

test.after.each(() => {
  browserslist.data = originData
  console.warn = originWarn
})

test('selects versions released after COVID', () => {
  equal(browserslist('since covid'), ['chrome 3', 'safari 1'])
})

test('is case insensitive', () => {
  equal(browserslist('Since COVID'), ['chrome 3', 'safari 1'])
})

test('works with alternate spelling', () => {
  equal(browserslist('post-COVID'), ['chrome 3', 'safari 1'])
})

test.run()
