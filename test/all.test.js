const { test } = require('uvu')
const { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
const browserslist = require('..')

const MAX_VERSIONS = Number.MAX_SAFE_INTEGER
const MAX_YEARS = Number.MAX_SAFE_INTEGER

const allTest = opts => {
  const result = browserslist('since 1990', opts)
  equal(browserslist('last ' + MAX_VERSIONS + ' versions', opts), result)
  equal(browserslist('last ' + MAX_YEARS + ' years', opts), result)
  // Removed until mobileToDesktop works for usage queries
  // equal(browserslist('>= 0%, not unreleased versions', opts), result)
}

test('Queries for all browsers', () => {
  allTest()
})
test('Queries for all browsers with mobile to desktop', () => {
  allTest({ mobileToDesktop: true })
})

test.run()
