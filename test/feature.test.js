let { test } = require('uvu')
let { equal, is, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originCache = browserslist.cache

test.before.each(() => {
  browserslist.cache = {}
  browserslist.data.and_chr = {
    name: 'and_chr',
    versions: ['81'],
    released: [],
    releaseDate: {}
  }
})

test.after.each(() => {
  browserslist.cache = originCache
})

test('load features from Can I Use', () => {
  is(browserslist('supports objectrtc').length > 0, true)
})

test('throw an error on wrong feature name from Can I Use', () => {
  throws(() => browserslist('supports wrong-feature-name'), /Unknown feature name/)
})

test('selects browsers by feature', () => {
  browserslist.cache = {
    rtcpeerconnection: {
      'and_chr 81': 'y',
      'firefox 2': 'n'
    }
  }

  equal(browserslist('supports rtcpeerconnection'), ['and_chr 81'])
})

test('selects browsers by feature with dashes in its name', () => {
  browserslist.cache = {
    'arrow-functions': {
      'and_chr 81': 'y',
      'ie 11': 'n'
    }
  }

  equal(browserslist('supports arrow-functions'), ['and_chr 81'])
})

test.run()
