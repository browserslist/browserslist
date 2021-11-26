let { test } = require('uvu')
let { equal, is } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('selects dead browsers by keywords', () => {
  is.not(browserslist('dead').indexOf('ie 10'), -1)
})

test('selects dead browsers case insensitive', () => {
  equal(browserslist('Dead'), browserslist('dead'))
})

test.run()
