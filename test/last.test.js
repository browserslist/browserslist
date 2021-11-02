let browserslist = require('..')

let originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11'],
      releaseDate: {}
    },
    edge: {
      name: 'edge',
      released: ['12'],
      versions: ['12', '13'],
      releaseDate: {}
    },
    chrome: {
      name: 'chrome',
      released: ['37', '38', '39'],
      versions: ['37', '38', '39', '40'],
      releaseDate: {}
    },
    bb: {
      name: 'bb',
      released: ['8'],
      versions: ['8'],
      releaseDate: {}
    },
    firefox: {
      name: 'firefox',
      released: [],
      versions: [],
      releaseDate: {}
    },
    android: {
      name: 'android',
      released: ['4.4', '4.4.3-4.4.4', '67'],
      versions: [],
      releaseDate: {}
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects versions of each browser', () => {
  expect(browserslist('last 2 versions')).toEqual([
    'android 67',
    'bb 8',
    'chrome 39',
    'chrome 38',
    'edge 12',
    'ie 11',
    'ie 10'
  ])
})

it('has special logic for android', () => {
  expect(browserslist('last 31 versions')).toEqual([
    'android 67',
    'android 4.4.3-4.4.4',
    'bb 8',
    'chrome 39',
    'chrome 38',
    'chrome 37',
    'edge 12',
    'ie 11',
    'ie 10',
    'ie 9'
  ])
})

it('supports pluralization', () => {
  expect(browserslist('last 1 version')).toEqual([
    'android 67',
    'bb 8',
    'chrome 39',
    'edge 12',
    'ie 11'
  ])
})

it('is case insensitive', () => {
  expect(browserslist('Last 01 Version')).toEqual([
    'android 67',
    'bb 8',
    'chrome 39',
    'edge 12',
    'ie 11'
  ])
})
