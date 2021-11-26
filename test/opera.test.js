let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('selects opera mini', () => {
  equal(browserslist('op_mini all'), ['op_mini all'])
})

test('selects opera mini case insensitive', () => {
  equal(browserslist('OperaMini All'), ['op_mini all'])
})

test.run()
