let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let RealDate = Date
let originData = { ...browserslist.data }
let originWarn = console.warn

function mockDate(iso) {
  global.Date = function (self) {
    Object.getPrototypeOf(RealDate.prototype).constructor.call(self)
    return new RealDate(iso)
  }
  global.Date.now = function () {
    return new RealDate(iso).valueOf()
  }
}

test.before.each(() => {
  mockDate('2018-01-01T00:00:00z')
  browserslist.data = {
    ie: {
      name: 'ie',
      versions: [],
      released: ['9', '10', '11'],
      releaseDate: {
        9: 1300060800, // 2011-03-14T00:00:00.000Z
        10: 1346716800, // 2012-09-04T00:00:00.000Z
        11: 1381968000 // 2013-10-17T00:00:00.000Z
      }
    },
    edge: {
      name: 'edge',
      versions: [],
      released: ['12', '13', '14', '15', '16'],
      releaseDate: {
        12: 1438128000, // 2015-07-29T00:00:00.000Z
        13: 1447286400, // 2015-11-12T00:00:00.000Z
        14: 1470096000, // 2016-08-02T00:00:00.000Z
        15: 1491868800, // 2017-04-11T00:00:00.000Z
        16: 1508198400 // 2017-10-17T00:00:00.000Z
      }
    }
  }
  console.warn = function (...args) {
    if (/(yarn|npm) upgrade/.test(args[0])) return
    originWarn.apply(this, args)
  }
})

test.after.each(() => {
  global.Date = RealDate
  browserslist.data = originData
})

test('selects versions released within last X years', () => {
  equal(browserslist('last 2 years'), ['edge 16', 'edge 15', 'edge 14'])
})

test('selects versions released within last year', () => {
  equal(browserslist('last 1 year'), ['edge 16', 'edge 15'])
})

test('supports year fraction', () => {
  equal(browserslist('last 1.4 years'), ['edge 16', 'edge 15'])
})

test('is case insensitive', () => {
  equal(browserslist('Last 5 years'), [
    'edge 16',
    'edge 15',
    'edge 14',
    'edge 13',
    'edge 12',
    'ie 11'
  ])
})

test.run()
