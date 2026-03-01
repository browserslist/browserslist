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
      released: ['8', '9', '10', '11.0.1', '11.1', '12'],
      versions: ['8', '9', '10', '11.0.1', '11.1', '12', '13'],
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
      released: ['8', '10'],
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
      versions: ['4.4', '4.4.3-4.4.4', '39'],
      releaseDate: {}
    }
  }
})

test.after.each(() => {
  browserslist.data = originData
})

test('selects versions of each browser', () => {
  equal(browserslist('last 2 major versions'), [
    'android 39',
    'bb 10',
    'bb 8',
    'chrome 39',
    'chrome 38',
    'edge 12',
    'edge 11.1',
    'edge 11.0.1',
    'ie 11',
    'ie 10'
  ])
})

test('supports pluralization', () => {
  equal(browserslist('last 1 major version'), [
    'android 39',
    'bb 10',
    'chrome 39',
    'edge 12',
    'ie 11'
  ])
})

test('is case insensitive', () => {
  equal(browserslist('Last 01 MaJoR Version'), [
    'android 39',
    'bb 10',
    'chrome 39',
    'edge 12',
    'ie 11'
  ])
})

test('selects versions of a single browser', () => {
  equal(browserslist('last 2 edge major versions'), [
    'edge 12',
    'edge 11.1',
    'edge 11.0.1'
  ])
  equal(browserslist('last 1 bb major version'), ['bb 10'])
  equal(browserslist('last 3 Chrome major versions'), [
    'chrome 39',
    'chrome 38',
    'chrome 37'
  ])
  equal(browserslist('last 2 android major versions'), ['android 39'])
})

test('supports non-sequential version numbers', () => {
  equal(browserslist('last 2 bb major versions'), ['bb 10', 'bb 8'])
})

test('supports more versions than have been released', () => {
  equal(browserslist('last 3 bb major versions'), ['bb 10', 'bb 8'])
})

test('supports Can I Use missing mobile versions', () => {
  let opts = { mobileToDesktop: true }
  equal(browserslist('last 2 android major versions', opts), [
    'android 39',
    'android 38'
  ])
})

test.run()
