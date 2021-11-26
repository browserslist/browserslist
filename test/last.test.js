let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }

test.before.each(() => {
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

test.after.each(() => {
  browserslist.data = originData
})

test('selects versions of each browser', () => {
  let res = browserslist('last 2 versions', undefined, true)

  equal(
    res,
    [
      'android 67',
      'bb 8',
      'chrome 39',
      'chrome 38',
      'edge 12',
      'ie 11',
      'ie 10'
    ]
  )
})

test('has special logic for android', () => {
  equal(
    browserslist('last 31 versions'),
    [
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
    ]
  )
})

test('supports pluralization', () => {
  equal(
    browserslist('last 1 version'),
      [
      'android 67',
      'bb 8',
      'chrome 39',
      'edge 12',
      'ie 11'
    ]
  )
})

test('is case insensitive', () => {
  equal(
    browserslist('Last 01 Version'),
    [
      'android 67',
      'bb 8',
      'chrome 39',
      'edge 12',
      'ie 11'
    ]
  )
})

test.run()
