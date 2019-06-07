var browserslist = require('../')

var originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11']
    },
    edge: {
      name: 'edge',
      released: ['8', '9', '10', '11.0.1', '11.1', '12'],
      versions: ['8', '9', '10', '11.0.1', '11.1', '12', '13']
    },
    chrome: {
      name: 'chrome',
      released: ['37', '38', '39'],
      versions: ['37', '38', '39', '40']
    },
    bb: {
      name: 'bb',
      released: ['8', '10'],
      versions: ['8']
    },
    firefox: {
      released: []
    },
    android: {
      name: 'android',
      released: ['4.4', '4.4.3-4.4.4', '67']
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects versions of each browser', () => {
  expect(browserslist('last 2 major versions')).toEqual([
    'android 67',
    'bb 10',
    'chrome 39',
    'chrome 38',
    'edge 12',
    'edge 11.1',
    'edge 11.0.1',
    'ie 11',
    'ie 10'
  ])
})

it('supports pluralization', () => {
  expect(browserslist('last 1 major version')).toEqual([
    'android 67', 'bb 10', 'chrome 39', 'edge 12', 'ie 11'
  ])
})

it('is case insensitive', () => {
  expect(browserslist('Last 01 MaJoR Version')).toEqual([
    'android 67', 'bb 10', 'chrome 39', 'edge 12', 'ie 11'
  ])
})

it('selects versions of a single browser', () => {
  expect(browserslist('last 2 edge major versions')).toEqual([
    'edge 12', 'edge 11.1', 'edge 11.0.1'
  ])
  expect(browserslist('last 1 bb major version')).toEqual([
    'bb 10'
  ])
  expect(browserslist('last 3 Chrome major versions')).toEqual([
    'chrome 39', 'chrome 38', 'chrome 37'
  ])
  expect(browserslist('last 2 android major versions')).toEqual([
    'android 67'
  ])
})
