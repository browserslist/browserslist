let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originUsage = browserslist.usage

test.before.each(() => {
  browserslist.usage = {
    global: {
      'ie 8': 1,
      'ie 9': 5,
      'ie 10': 10.1,
      'ie 11': 75
    }
  }
})

test.after.each(() => {
  browserslist.usage = originUsage
})

test('selects browsers by popularity', () => {
  equal(browserslist('> 10%'), ['ie 11', 'ie 10'])
})

test('selects popularity by more or equal', () => {
  equal(browserslist('>= 5%'), ['ie 11', 'ie 10', 'ie 9'])
})

test('selects browsers by unpopularity', () => {
  equal(browserslist('< 5%'), ['ie 8'])
})

test('selects unpopularity by less or equal', () => {
  equal(browserslist('<= 5%'), ['ie 9', 'ie 8'])
})

test('accepts non-space query', () => {
  equal(browserslist('>10%'), ['ie 11', 'ie 10'])
})

test('works with float', () => {
  equal(browserslist('> 10.2%'), ['ie 11'])
})

test('works with float that has a leading dot', () => {
  equal(browserslist('> .2%'), ['ie 11', 'ie 10', 'ie 9', 'ie 8'])
})

test('allows omission of the space between the > and the percentage', () => {
  equal(browserslist('>10%'), ['ie 11', 'ie 10'])
})

test.run()
