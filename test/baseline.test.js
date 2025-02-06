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

function time(date) {
  return new Date(date).getTime() / 1000
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
      versions: ['15', '16', '17', '17.1', 'TP'],
      released: ['15', '16', '17', '17.1'],
      releaseDate: {
        15: offsetByMonth(-35),
        16: offsetByMonth(-25),
        17: offsetByMonth(-15),
        '17.1': offsetByMonth(-14),
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

test('selects last significant versions of each baseline browser', () => {
  equal(browserslist('baseline newly available'), ['chrome 114', 'safari 17.1'])
})

test('is case insensitive', () => {
  equal(browserslist('baseline NEWLY  available'), ['chrome 114', 'safari 17.1'])
})

test('selects all versions of each baseline browser released since 30 months ago', () => {
  equal(browserslist('baseline widely available'), [
    'chrome 114',
    'chrome 113',
    'chrome 112',
    'chrome 111',
    'safari 17.1',
    'safari 17',
    'safari 16',
  ])
})

test('selects versions since a baseline boundary', () => {
  browserslist.data = {
    ie: {
      name: 'ie',
      versions: ['1', '2', '3'],
      released: ['1', '2', '3'],
      releaseDate: {
        1: 0, // 01 Jan 1970 00:00:00 +0000
        2: time('2008-01-01:00:00Z'),
        3: time('2009-01-01:00:00Z'),
      }
    },
    chrome: {
      name: 'chrome',
      versions: ['110', '111', '112', '113', '114', 'canary'],
      released: ['110', '111', '112', '113', '114'],
      releaseDate: {
        110: time('2022-10-10:00:00Z'),
        111: time('2022-11-10:00:00Z'),
        112: time('2022-12-10:00:00Z'),
        113: time('2023-01-10:00:00Z'),
        114: time('2023-02-10:00:00Z'),
        canary: null // unreleased
      }
    },
    opera: {
      name: 'chrome',
      versions: ['110', '111', '112', '113', '114', 'canary'],
      released: ['110', '111', '112', '113', '114'],
      releaseDate: {
        110: time('2022-10-10:00:00Z'),
        111: time('2022-11-10:00:00Z'),
        112: time('2022-12-10:00:00Z'),
        113: time('2023-01-10:00:00Z'),
        114: time('2023-02-10:00:00Z'),
        canary: null // unreleased
      }
    },
    edge: {
      name: 'edge',
      versions: ['100', 'canary'],
      released: ['100'],
      releaseDate: {
        100: time('2012-10-10:00:00Z'),
        canary: null // unreleased
      }
    },
    firefox: {
      name: 'firefox',
      versions: ['120', '121', '122', '123', '124', 'beta'],
      released: ['120', '121', '122', '123', '124'],
      releaseDate: {
        120: time('2023-10-10:00:00Z'),
        121: time('2023-11-10:00:00Z'),
        122: time('2023-12-10:00:00Z'),
        123: time('2024-01-10:00:00Z'),
        124: time('2024-02-10:00:00Z'),
        beta: null // unreleased
      }
    },
    safari: {
      name: 'safari',
      versions: ['15', '16', '17', '17.1', 'TP'],
      released: ['15', '16', '17', '17.1'],
      releaseDate: {
        15: time('2021-09-10:00:00Z'),
        16: time('2022-09-10:00:00Z'),
        17: time('2023-09-10:00:00Z'),
        '17.1': time('2023-10-10:00:00Z'),
        TP: null // unreleased
      }
    },
  }

  equal(browserslist(`baseline 2024`), [
    'chrome 114',
    'edge 100',
    'firefox 124',
    'safari 17.1'
  ])
  equal(browserslist(`baseline 2023`), [
    'chrome 114',
    'edge 100',
    'firefox 124',
    'firefox 123',
    'firefox 122',
    'safari 17.1'
  ])
  equal(browserslist(`baseline 2022`), [
    'chrome 114',
    'chrome 113',
    'chrome 112',
    'edge 100',
    'firefox 124',
    'firefox 123',
    'firefox 122',
    'firefox 121',
    'firefox 120',
    'safari 17.1',
    'safari 17',
    'safari 16'
  ])
  equal(browserslist(`baseline 2021`), [
    'chrome 114',
    'chrome 113',
    'chrome 112',
    'chrome 111',
    'chrome 110',
    'edge 100',
    'firefox 124',
    'firefox 123',
    'firefox 122',
    'firefox 121',
    'firefox 120',
    'safari 17.1',
    'safari 17',
    'safari 16',
    'safari 15'
  ])
})

test.run()
