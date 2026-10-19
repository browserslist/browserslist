let { test } = require('uvu')
let { equal, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }

test.before.each(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['8', '9', '10', '11'],
      versions: ['8', '9', '10', '11'],
      releaseDate: {}
    },
    android: {
      name: 'android',
      released: ['4.2-4.3', '4.4', '4.4.3-4.4.4', '37'],
      versions: ['4.2-4.3', '4.4', '4.4.3-4.4.4', '37'],
      releaseDate: {}
    },
    ios_saf: {
      name: 'ios_saf',
      released: ['15.0', '15.6-15.8', '16.0'],
      versions: ['15.0', '15.6-15.8', '16.0'],
      releaseDate: {}
    }
  }
})

test.after.each(() => {
  browserslist.data = originData
})

test('selects a range of browsers', () => {
  equal(browserslist('ie 8-10'), ['ie 10', 'ie 9', 'ie 8'])
})

test('selects versions with query out of range', () => {
  equal(browserslist('ie 1-12'), ['ie 11', 'ie 10', 'ie 9', 'ie 8'])
})

test('selects a range of android browsers', () => {
  equal(browserslist('android 4.3-37'), [
    'android 37',
    'android 4.4.3-4.4.4',
    'android 4.4',
    'android 4.2-4.3'
  ])
})

test('selects joined version when range starts inside it', () => {
  equal(browserslist('ios 15.7-16'), ['ios_saf 16.0', 'ios_saf 15.6-15.8'])
  equal(browserslist('ios 15.8-16'), ['ios_saf 16.0', 'ios_saf 15.6-15.8'])
  equal(browserslist('ios 15-15.7'), ['ios_saf 15.6-15.8', 'ios_saf 15.0'])
})

test('raises on an unknown browser', () => {
  throws(() => browserslist('unknown 4-7'), 'Unknown browser unknown')
})

test.run()
