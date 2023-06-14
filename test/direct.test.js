let { test } = require('uvu')
let { equal, throws, is, not } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('selects browser by name', () => {
  equal(browserslist('ie 10'), ['ie 10'])
})

test('uses case insensitive aliases', () => {
  let result = browserslist('ie 10')
  equal(browserslist('Explorer 10'), result)
  equal(browserslist('IE 10'), result)
})

test('raises on unknown name', () => {
  throws(() => browserslist('unknow 10'), 'Unknown browser unknow')
})

test('raises on unknown version', () => {
  throws(() => browserslist('IE 1'), 'Unknown version 1 of IE')
})

test('uses right browser name in error', () => {
  throws(
    () => browserslist('chrome 70, ie 11, safari 12.2, safari 12'),
    'Unknown version 12.2 of safari'
  )
})

test('ignores unknown versions on request', () => {
  equal(browserslist('IE 1, IE 9', { ignoreUnknownVersions: true }), ['ie 9'])
})

test('works with joined versions from Can I Use', () => {
  equal(browserslist('ios 7.0'), ['ios_saf 7.0-7.1'])
  equal(browserslist('ios 7.1'), ['ios_saf 7.0-7.1'])
})

test('allows to miss zero in version', () => {
  equal(browserslist('ios 7'), ['ios_saf 7.0-7.1'])
  equal(browserslist('ios 8.0'), ['ios_saf 8'])
})

test('supports Safari TP', () => {
  equal(browserslist('safari tp'), ['safari TP'])
  equal(browserslist('Safari TP'), ['safari TP'])
})

test('supports Can I Use cutted versions', () => {
  is(browserslist('and_uc 10').length, 1)
})

test('supports Can I Use missing mobile versions', () => {
  let opts = { mobileToDesktop: true }
  equal(browserslist('chromeandroid 53', opts), ['and_chr 53'])
  equal(browserslist('and_ff 60', opts), ['and_ff 60'])
  equal(browserslist('ie_mob 9', opts), ['ie_mob 9'])
  equal(browserslist('chromeandroid >= 52 and chromeandroid < 54', opts), [
    'and_chr 53',
    'and_chr 52'
  ])
  equal(browserslist('and_chr 52-53', opts), ['and_chr 53', 'and_chr 52'])
  equal(browserslist('android 4.4-38', opts), [
    'android 38',
    'android 37',
    'android 4.4.3-4.4.4',
    'android 4.4'
  ])
})

test('missing mobile versions are not aliased by default', () => {
  not.equal(browserslist('chromeandroid 53'), ['and_chr 53'])
  not.equal(browserslist('and_ff 60'), ['and_ff 60'])
  throws(() => browserslist('ie_mob 9'), /Unknown version 9 of ie_mob/)
  throws(() => browserslist('op_mob 30'), /Unknown version 30/)
})

test('works for all browsers', () => {
  not.throws(() => {
    let first = browserslist(['> 0%', 'dead'])
    browserslist(first, { mobileToDesktop: true })
  })
})

test.run()
