let { test } = require('uvu')
let { equal } = require('uvu/assert')
let { join } = require('path')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let PACKAGE = join(__dirname, 'fixtures', 'package2')

test('query composition with AND operator', () => {
  equal(
    browserslist('ie >= 6, ie <= 7'),
    [
      'ie 11',
      'ie 10',
      'ie 9',
      'ie 8',
      'ie 7',
      'ie 6',
      'ie 5.5'
    ]
  )

  equal(browserslist('ie >= 6 and ie <= 7'), ['ie 7', 'ie 6'])

  equal(
    browserslist('ie < 11 and not ie 7'),
    [
      'ie 10',
      'ie 9',
      'ie 8',
      'ie 6',
      'ie 5.5'
    ]
  )
})

test('correctly works with not and one-version browsers as AND query', () => {
  equal(browserslist('last 1 Baidu version and not <2% in AT'), ['baidu 7.12'])
})

test('reads config from package.json', () => {
  equal(
    browserslist.findConfig(PACKAGE),
    { defaults: 'ie > 6 and ie 9 or ie 10' }
  )

  equal(browserslist(null, { path: PACKAGE }), ['ie 10', 'ie 9'])
})

test.run()
