let { test } = require('uvu')
let { is, equal } = require('uvu/assert')

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
    android: {
      name: 'android',
      released: ['4.4', '4.4.3-4.4.4', '67'],
      versions: [],
      releaseDate: {}
    }
  }
});

test.after.each(() => {
  browserslist.data = originData
})

test('selects versions of browser', () => {
  equal(browserslist('last 2 ie versions'), ['ie 11', 'ie 10'])
})

test('does not include unreleased versions', () => {
  browserslist.data = originData
  is(browserslist('last 2 safari versions').indexOf('safari TP'), -1)
})

test('supports pluralization', () => {
  equal(browserslist('last 1 ie version'), ['ie 11'])
})

test('has case insensitive aliases', () => {
  equal(browserslist('Last 01 Explorer Version'), ['ie 11'])
})

test('has special logic for android', () => {
  equal(browserslist('last 4 android versions'), ['android 67'])
  equal(
    browserslist('last 31 android versions'),
    [
      'android 67',
      'android 4.4.3-4.4.4'
    ]
  )
})

test.run()
