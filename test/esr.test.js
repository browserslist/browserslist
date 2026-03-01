let { test } = require('uvu')
let { equal, is, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('selects Firefox ESR', () => {
  let versions = browserslist('Firefox ESR')
  is(versions.length >= 1, true)
  is(
    versions.every(i => /^firefox \d+$/.test(i)),
    true
  )
})

test('can use esr in version range for firefox', () => {
  let versions = browserslist('Firefox >= ESR')
  is(versions.length >= 1, true)
  is(
    versions.every(i => /^firefox \d+$/.test(i)),
    true
  )
})

test('uses case insensitive aliases', () => {
  let result = browserslist('Firefox ESR')
  equal(browserslist('firefox esr'), result)
  equal(browserslist('ff esr'), result)
  equal(browserslist('fx esr'), result)
  equal(browserslist('ff >= esr and fx <= esr'), result)
})

test('throw error when using esr in range for unsupported browsers', () => {
  throws(
    () => browserslist('Chrome >= ESR'),
    /Unknown version ESR of Chrome/
  )
})

test.run()
