let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('selects defaults by keywords', () => {
  equal(
    browserslist('defaults, ie 6'),
    browserslist(browserslist.defaults.concat(['ie 6']))
  )
})

test('selects defaults case insensitive', () => {
  equal(browserslist('Defaults'), browserslist(browserslist.defaults))
})

test('should respect options', () => {
  equal(
    browserslist('defaults', { mobileToDesktop: true }),
    browserslist(browserslist.defaults, { mobileToDesktop: true })
  )
})

test.run()
