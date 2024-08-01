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
      released: ['4.2-4.3'],
      versions: ['4.2-4.3'],
      releaseDate: {}
    },
    and_qq: {
      name: 'and_qq',
      released: ['1.2'],
      versions: ['1.2'],
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

test('selects browser by more sign', () => {
  equal(browserslist('ie > 9'), ['ie 11', 'ie 10'])
})

test('selects browser by more or equal sign', () => {
  equal(browserslist('ie >= 10'), ['ie 11', 'ie 10'])
})

test('selects browser by less sign', () => {
  equal(browserslist('ie < 10'), ['ie 9', 'ie 8'])
})

test('selects browser by less or equal sign', () => {
  equal(browserslist('ie <= 9'), ['ie 9', 'ie 8'])
})

test('uses case insensitive aliases', () => {
  equal(browserslist('Explorer > 10'), ['ie 11'])
})

test('raises on unknown browser', () => {
  throws(() => {
    browserslist('unknown > 10')
  }, 'Unknown browser unknown')
})

test('works with joined versions from Can I Use', () => {
  equal(browserslist('android >= 4.2'), ['android 4.2-4.3'])
  equal(browserslist('android >= 4.3'), ['android 4.2-4.3'])
})

test('allows omission of the space around the operator', () => {
  equal(browserslist('ie<=9'), ['ie 9', 'ie 8'])
})

test('selects browser with one version', () => {
  equal(browserslist('and_qq > 0'), ['and_qq 1.2'])
})

test('selects browser gte or gt between version range', () => {
  equal(browserslist('ios >= 15.7.2'), ['ios_saf 16.0', 'ios_saf 15.6-15.8'])
  equal(browserslist('ios > 15.7.2'), ['ios_saf 16.0', 'ios_saf 15.6-15.8'])
})

test('selects browser lte or lt between version range', () => {
  equal(browserslist('ios <= 15.7.2'), ['ios_saf 15.6-15.8', 'ios_saf 15.0'])
  equal(browserslist('ios < 15.7.2'), ['ios_saf 15.6-15.8', 'ios_saf 15.0'])
})

test.run()
