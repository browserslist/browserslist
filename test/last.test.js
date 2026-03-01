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
      released: ['36', '37', '38', '39'],
      versions: ['36', '37', '38', '39', '40'],
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
      released: ['4.4', '4.4.3-4.4.4', '39'],
      versions: [],
      releaseDate: {}
    },
    opera: {
      name: 'opera',
      released: ['85', '86'],
      versions: ['85', '86', '87'],
      releaseDate: {}
    },
    op_mob: {
      name: 'op_mob',
      released: ['12', '12.1', '17'],
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

  equal(res, [
    'android 39',
    'bb 8',
    'chrome 39',
    'chrome 38',
    'edge 12',
    'ie 11',
    'ie 10',
    'op_mob 17',
    'opera 86',
    'opera 85'
  ])
})

test('Properly handles Android version jump', () => {
  equal(browserslist('last 3 android versions'), ['android 39'])
  equal(browserslist('last 4 android versions'), [
    'android 39',
    'android 4.4.3-4.4.4'
  ])
})

test('Properly handles Opera Mobile version jump', () => {
  equal(browserslist('last 4 op_mob versions'), ['op_mob 17'])
  equal(browserslist('last 5 op_mob versions'), ['op_mob 17', 'op_mob 12.1'])
})

test('supports pluralization', () => {
  equal(browserslist('last 1 version'), [
    'android 39',
    'bb 8',
    'chrome 39',
    'edge 12',
    'ie 11',
    'op_mob 17',
    'opera 86'
  ])
})

test('is case insensitive', () => {
  equal(browserslist('Last 01 Version'), [
    'android 39',
    'bb 8',
    'chrome 39',
    'edge 12',
    'ie 11',
    'op_mob 17',
    'opera 86'
  ])
})

test('excludes unreleased versions if enabling mobile to desktop', () => {
  equal(browserslist('last 2 versions', { mobileToDesktop: true }), [
    'and_chr 39',
    'and_chr 38',
    'android 39',
    'android 38',
    'bb 8',
    'chrome 39',
    'chrome 38',
    'edge 12',
    'ie 11',
    'ie 10',
    'ie_mob 11',
    'ie_mob 10',
    'op_mob 17',
    'opera 86',
    'opera 85'
  ])
})

test.run()
