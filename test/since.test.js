var browserslist = require('../')

var originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      versions: ['5.5', '6', '7', '8', '9', '10', '11'],
      releaseDate: {
        '6': 998870400,
        '7': 1161129600,
        '8': 1237420800,
        '9': 1300060800,
        '10': 1346716800,
        '11': 1381968000,
        '5.5': 962323200
      }
    },
    safari: {
      name: 'safari',
      versions: [
        '3.1', '3.2', '4', '5', '5.1', '6', '6.1', '7', '7.1', '8', '9', '9.1',
        '10', '10.1', '11', 'TP'
      ],
      releaseDate: {
        '4': 1244419200,
        '5': 1275868800,
        '6': 1343174400,
        '7': 1382400000,
        '8': 1413417600,
        '9': 1443657600,
        '10': 1474329600,
        '11': 1505779200,
        '3.1': 1205798400,
        '3.2': 1226534400,
        '5.1': 1311120000,
        '6.1': 1382400000,
        '7.1': 1410998400,
        '9.1': 1458518400,
        '10.1': 1490572800,
        TP: null
      }
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects versions released since specified year', () => {
  expect(browserslist('since 2013'))
    .toEqual([
      'ie 11', 'safari 11', 'safari 10.1', 'safari 10', 'safari 9.1',
      'safari 9', 'safari 8', 'safari 7.1', 'safari 7', 'safari 6.1'
    ])
})

it('is case insensitive', () => {
  expect(browserslist('sInCe 2016'))
    .toEqual(['safari 11', 'safari 10.1', 'safari 10', 'safari 9.1'])
})

it('throws error on incorrect year', () => {
  expect(() => browserslist('since 9999')).toThrow()
})
