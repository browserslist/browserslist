let { test } = require('uvu')
let { is, equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originUsage = browserslist.usage

test.before.each(() => {
  browserslist.usage = {
    US: {
      'ie 8': 1,
      'ie 9': 5,
      'ie 10': 10.1,
      'ie 11': 75
    },
    XX: {
      'and_chr 0': 100
    }
  }
  browserslist.data.and_chr = {
    name: 'and_chr',
    versions: ['80'],
    released: [],
    releaseDate: {}
  }
})

test.after.each(() => {
  browserslist.usage = originUsage
})

test('selects browsers by popularity', () => {
  equal(browserslist('> 10% in US'), ['ie 11', 'ie 10'])
})

test('selects popularity by more or equal', () => {
  equal(browserslist('>= 5% in US'), ['ie 11', 'ie 10', 'ie 9'])
})

test('selects browsers by unpopularity', () => {
  equal(browserslist('< 5% in US'), ['ie 8'])
})

test('selects unpopularity by less or equal', () => {
  equal(browserslist('<= 5% in US'), ['ie 9', 'ie 8'])
})

test('works with float', () => {
  equal(browserslist('> 10.2% in US'), ['ie 11'])
})

test('works with float that has a leading dot', () => {
  equal(
    browserslist('> .2% in US'),
    [
      'ie 11',
      'ie 10',
      'ie 9',
      'ie 8'
    ]
  )
})

test('fixes country case', () => {
  equal(browserslist('> 10.2% in us'), ['ie 11'])
})

test('loads country from Can I Use', () => {
  is(browserslist('> 1% in RU').length > 0, true)
})

test('loads continents from Can I Use', () => {
  is(browserslist('> 1% in alt-AS').length > 0, true)
})

test('allows omission of the space between the > and the percentage', () => {
  is(browserslist('>10% in US').length > 0, true)
})

test('normalize incorrect caniuse versions for and_*', () => {
  equal(browserslist('> 50% in XX'), ['and_chr 80'])
})

test.run()
