var browserslist = require('../')

var RealDate = Date
var originData = browserslist.data
var originWarn = console.warn

function mockDate (iso) {
  global.Date = function () {
    Object.getPrototypeOf(RealDate.prototype).constructor.call(this)
    return new RealDate(iso)
  }
  global.Date.now = RealDate.now
}

beforeEach(() => {
  mockDate('2018-01-01T00:00:00z')
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      releaseDate: {
        '9': 1300060800, // 2011-03-14T00:00:00.000Z
        '10': 1346716800, // 2012-09-04T00:00:00.000Z
        '11': 1381968000 // 2013-10-17T00:00:00.000Z
      }
    },
    edge: {
      name: 'edge',
      released: ['12', '13', '14', '15', '16'],
      releaseDate: {
        '12': 1438128000, // 2015-07-29T00:00:00.000Z
        '13': 1447286400, // 2015-11-12T00:00:00.000Z
        '14': 1470096000, // 2016-08-02T00:00:00.000Z
        '15': 1491868800, // 2017-04-11T00:00:00.000Z
        '16': 1508198400 // 2017-10-17T00:00:00.000Z
      }
    }
  }
  console.warn = function () {
    if (
      typeof arguments[0] === 'string' &&
      (
        /yarn upgrade/.test(arguments[0]) ||
        /npm update/.test(arguments[0])
      )
    ) {
      return
    }
    originWarn.apply(this, arguments)
  }
})

afterEach(() => {
  global.Date = RealDate
  browserslist.data = originData
  console.warn = originWarn
})

it('selects versions released within last X years', () => {
  expect(browserslist('last 2 years'))
    .toEqual(['edge 16', 'edge 15', 'edge 14'])
})

it('selects versions released within last year', () => {
  expect(browserslist('last 1 year'))
    .toEqual(['edge 16', 'edge 15'])
})

it('is case insensitive', () => {
  expect(browserslist('Last 5 years'))
    .toEqual(['edge 16', 'edge 15', 'edge 14', 'edge 13', 'edge 12', 'ie 11'])
})
