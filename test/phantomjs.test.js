let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('converts PhantomJS to Safari', () => {
  equal(browserslist('phantomjs 2.1'), ['safari 6'])
  equal(browserslist('phantomjs 1.9'), ['safari 5'])
})

test('supports case insensitive PhantomJS name', () => {
  equal(browserslist('PhantomJS 2.1'), ['safari 6'])
  equal(browserslist('PhantomJS 1.9'), ['safari 5'])
})

test.run()
