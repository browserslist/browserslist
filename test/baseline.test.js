let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }
let originWarn = console.warn

function offsetByMonth(monthsOffset) {
  var date = new Date()
  date.setUTCMonth(date.getUTCMonth() + monthsOffset)
  return date.getTime() / 1000
}

function offsetByYear(yearOffset) {
  var date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() + yearOffset)
  return date.getUTCFullYear()
}

test.before.each(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      versions: ['1', '2', '3'],
      released: ['1', '2', '3'],
      releaseDate: {
        1: 0, // 01 Jan 1970 00:00:00 +0000
        2: offsetByMonth(-180),
        3: offsetByMonth(-170),
      }
    },
    chrome: {
      name: 'chrome',
      versions: ['110', '111', '112', '113', '114', 'canary'],
      released: ['110', '111', '112', '113', '114'],
      releaseDate: {
        110: offsetByMonth(-31),
        111: offsetByMonth(-30),
        112: offsetByMonth(-29),
        113: offsetByMonth(-28),
        114: offsetByMonth(-27),
        canary: null // unreleased
      }
    },
    opera: {
      name: 'opera',
      versions: ['110', '111', '112', '113', '114', 'beta'],
      released: ['110', '111', '112', '113', '114'],
      releaseDate: {
        110: offsetByMonth(-31),
        111: offsetByMonth(-30),
        112: offsetByMonth(-29),
        113: offsetByMonth(-28),
        114: offsetByMonth(-27),
        beta: null // unreleased
      }
    },
    safari: {
      name: 'safari',
      versions: ['15', '16', '17', 'TP'],
      released: ['15', '16', '17'],
      releaseDate: {
        15: offsetByMonth(-35),
        16: offsetByMonth(-25),
        17: offsetByMonth(-15),
        TP: null // unreleased
      }
    },
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

test('selects last major versions of each baseline browser', () => {
  equal(browserslist('baseline low'), ['chrome 114', 'safari 17'])
})

test('is case insensitive', () => {
  equal(browserslist('baseline LOW'), ['chrome 114', 'safari 17'])
})

test('selects all major versions of each baseline browser released since 30 months ago', () => {
  equal(browserslist('baseline high'), [
    'chrome 114',
    'chrome 113',
    'chrome 112',
    'chrome 111',
    'safari 17',
    'safari 16',
  ])
})

test('selects versions since a baseline boundary', () => {
  equal(browserslist(`baseline ${offsetByYear(0)}`), [])
  equal(browserslist(`baseline ${offsetByYear(-1)}`), ['safari 17'])
  equal(browserslist(`baseline ${offsetByYear(-2)}`), [
    'chrome 114',
    'chrome 113',
    'chrome 112',
    'safari 17',
    'safari 16',
  ])
})

test.run()
