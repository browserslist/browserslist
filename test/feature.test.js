let { test } = require('uvu')
let { equal, is, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }

test.before.each(() => {
  browserslist.data = {
    and_chr: {
      name: 'and_chr',
      versions: ['81'],
      released: ['81'],
      releaseDate: {}
    },
    chrome: {
      name: 'chrome',
      versions: ['80', '81', '82'],
      released: ['80', '81'],
      releaseDate: {}
    },
    ie: {
      name: 'ie',
      versions: ['10', '11'],
      released: ['10', '11'],
      releaseDate: {}
    }
  }
})

test.after.each(() => {
  browserslist.clearCaches()
  browserslist.data = originData
})

test('load features from Can I Use', () => {
  browserslist.data = originData
  is(browserslist('supports objectrtc').length > 0, true)
})

test('throw an error on wrong feature name from Can I Use', () => {
  throws(
    () => browserslist('supports wrong-feature-name'),
    /Unknown feature name/
  )
})

test('selects browsers by feature, including partial support by default', () => {
  browserslist.cache.rtcpeerconnection = {
    and_chr: { 81: 'y' },
    chrome: { 80: 'n', 81: 'a', 82: 'y' },
    ie: { 10: 'n', 11: 'n' }
  }

  equal(browserslist('supports rtcpeerconnection'), [
    'and_chr 81',
    'chrome 82',
    'chrome 81'
  ])
})

test('selects browsers by feature, omiting partial support in in strict mode', () => {
  browserslist.cache.rtcpeerconnection = {
    and_chr: { 81: 'y' },
    chrome: { 80: 'n', 81: 'a', 82: 'y' },
    ie: { 10: 'n', 11: 'n' }
  }

  equal(browserslist('fully supports rtcpeerconnection'), [
    'and_chr 81',
    'chrome 82',
  ])
})


test('selects browsers by feature with dashes in its name', () => {
  browserslist.cache['arrow-functions'] = {
    and_chr: { 81: 'n' },
    chrome: { 80: 'n', 81: 'y', 82: 'y' },
    ie: { 10: 'n', 11: 'y' }
  }

  equal(browserslist('supports arrow-functions'), [
    'chrome 82',
    'chrome 81',
    'ie 11'
  ])
})

test('Selects extra versions with mobile to desktop option', () => {
  browserslist.cache.filesystem = {
    and_chr: { 81: 'y' },
    chrome: { 80: 'y', 81: 'y', 82: 'y' },
    ie: { 10: 'n', 11: 'n' }
  }

  equal(browserslist('supports filesystem', { mobileToDesktop: true }), [
    'and_chr 82',
    'and_chr 81',
    'and_chr 80',
    'chrome 82',
    'chrome 81',
    'chrome 80'
  ])
})

test('Ignores mobile to desktop if unsupported by latest', () => {
  browserslist.cache['font-smooth'] = {
    and_chr: { 81: 'n' },
    chrome: { 80: 'y', 81: 'y', 82: 'y' },
    ie: { 10: 'n', 11: 'n' }
  }

  equal(browserslist('supports font-smooth', { mobileToDesktop: true }), [
    'chrome 82',
    'chrome 81',
    'chrome 80'
  ])
})

test.run()
