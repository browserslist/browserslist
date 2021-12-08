delete require.cache[require.resolve('..')]

let { equal, throws, is, type, not } = require('uvu/assert')
let { spyOn, restoreAll } = require('nanospy')
let { test } = require('uvu')
let path = require('path')

let browserslist = require('..')

let IE = path.join(__dirname, 'fixtures', 'explorers')
let FILE = path.join(__dirname, 'fixtures', 'dir', 'test.css')
let LINK = path.join(__dirname, 'fixtures', 'symlink')
let CONFIG = path.join(__dirname, 'fixtures', 'env-config', 'test.css')
let STRING = path.join(__dirname, 'fixtures', 'string', 'package.json')
let PACKAGE = path.join(__dirname, 'fixtures', 'env-package', 'package.json')

let DEFAULTS = browserslist(browserslist.defaults)
test.after.each(() => {
  restoreAll()
  process.env.NODE_ENV = 'test'
  delete process.env.BROWSERSLIST
  delete process.env.BROWSERSLIST_CONFIG
  delete process.env.BROWSERSLIST_ENV
})

test('accepts array', () => {
  equal(browserslist(['ie 11', 'ie 10']), ['ie 11', 'ie 10'])
})

test('accepts string', () => {
  equal(browserslist('ie 11, ie 10'), ['ie 11', 'ie 10'])
})

test('trims queries', () => {
  equal(browserslist(['ie 11 ', ' ie 10']), ['ie 11', 'ie 10'])
  equal(browserslist('ie 11 , ie 10'), ['ie 11', 'ie 10'])
})

test('does not accept non-string and non-array parameters', () => {
  throws(() => browserslist({}), /an array or string. Got object/)
})

test('returns unique array', () => {
  equal(browserslist('ie 10, ie 10'), ['ie 10'])
})

test('returns empty result', () => {
  equal(browserslist([]), [])
  equal(browserslist(''), [])
})

test('uses environment variable on empty request', () => {
  process.env.BROWSERSLIST = 'ie 10'
  equal(browserslist(null, { path: FILE }), ['ie 10'])
})

test('reads config on no variable', () => {
  equal(browserslist(null, { path: FILE }), ['ie 11', 'ie 10'])
})

test('reads config by direct path', () => {
  equal(browserslist(null, { config: IE }), ['ie 9', 'ie 8'])
})

test('reads package.json config by direct path', () => {
  equal(browserslist(null, { config: PACKAGE, env: 'development' }), [
    'chrome 55',
    'firefox 50'
  ])
})

test('reads package.json config with one string', () => {
  equal(browserslist(null, { config: STRING }), ['ie 9', 'ie 8'])
})

test('reads config by direct path in environment variable', () => {
  process.env.BROWSERSLIST_CONFIG = IE
  equal(browserslist(null, { path: FILE }), ['ie 9', 'ie 8'])
})

test('handles undefined stats and path correctly', () => {
  let config = { stats: undefined, path: undefined }
  equal(browserslist([], config), [])
})

test('throw a error on wrong path to config', () => {
  throws(() => browserslist(null, { config: IE + '2' }), /Can't read/)
})

if (!/^win/.test(process.platform)) {
  test('reads config by symlink', () => {
    equal(browserslist(null, { config: LINK }), ['ie 9', 'ie 8'])
  })
}

test('has default selection', () => {
  is(browserslist.defaults.length > 0, true)
})

test('uses default selection on empty request and no config', () => {
  equal(browserslist(), DEFAULTS)
})

test('uses current dir on undefined path', () => {
  let loadConfig = spyOn(browserslist, 'loadConfig')

  equal(browserslist(undefined, { path: undefined }), DEFAULTS)

  equal(loadConfig.calls, [[{ path: process.cwd() }]])
})

test('uses default selection on disabled path', () => {
  let loadConfig = spyOn(browserslist, 'loadConfig')

  equal(browserslist(null, { path: false }), DEFAULTS)
  equal(loadConfig.calls, [[{ path: false }]])
})

test('raises on unknow query', () => {
  throws(() => browserslist('good'), 'Unknown browser query `good`')
  throws(() => browserslist('IE === 9'), 'Unknown browser query `IE === 9`')
})

test('raises on missed version', () => {
  throws(() => browserslist('IE'), 'Specify versions in Browserslist query for browser IE')
})

test('sorts browsers', () => {
  equal(
    browserslist(['ff 10', 'ie 11', 'ie 6', 'ie 10', 'ff 9']),
    [
      'firefox 10',
      'firefox 9',
      'ie 11',
      'ie 10',
      'ie 6'
    ]
  )
})

test('sorts browsers with version ranges', () => {
  equal(
    browserslist(['ios_saf 7', 'ie 11', 'ie 6', 'ios_saf 10']),
    [
      'ie 11',
      'ie 6',
      'ios_saf 10.0-10.2',
      'ios_saf 7.0-7.1'
    ]
  )
})

test('throws custom error', () => {
  let error
  try {
    browserslist('wrong')
  } catch (e) {
    if (e instanceof Error) error = e
  }
  equal(error.name, 'BrowserslistError')
  type(error.stack, 'string')
})

test('excludes queries', () => {
  equal(
    browserslist(['ie >= 9', 'not ie 11', 'not ie 10', 'ie 10']),
    ['ie 10', 'ie 9']
  )
})

test('excludes queries for 0 version', () => {
  let browsers = browserslist(['> 1% in US', 'not last 2 and_chr versions'])
  let android = browsers.filter(i => i.indexOf('and_chr ') !== -1)
  is(android.length, 0)
})

test('excludes queries for all version', () => {
  let browsers = browserslist(['> 0% in US', 'not last 1 op_mini versions'])
  let operaMini = browsers.filter(i => i.indexOf('op_mini ') !== -1)
  is(operaMini.length, 0)
})

test('has actual browsers list in docs', () => {
  let names = browserslist(['last 1 version']).map(i => i.split(' ')[0])
  equal(
    names,
    [
      'and_chr',
      'and_ff',
      'and_qq',
      'and_uc',
      'android',
      'baidu',
      'bb',
      'chrome',
      'edge',
      'firefox',
      'ie',
      'ie_mob',
      'ios_saf',
      'kaios',
      'op_mini',
      'op_mob',
      'opera',
      'safari',
      'samsung'
    ]
  )
})

test('throws error on first exclude query', () => {
  throws(
    () => browserslist(['not ie 11']),
    'Write any browsers query (for instance, `defaults`) ' +
      'before `not ie 11`'
  )
})

test('cleans 0 version', () => {
  not.match(browserslist(['> 0%', '> 0% in FI']), 'and_chr 0')
})

test('uses env options to browserlist config', () => {
  equal(
    browserslist(null, { path: CONFIG, env: 'production' }),
    ['ie 9', 'opera 41']
  )

  equal(browserslist(null, { path: CONFIG, env: 'staging' }), ['ie 9', 'opera 41'])

  equal(browserslist(null, { path: CONFIG, env: 'development' }), ['chrome 55', 'firefox 50'])

  equal(browserslist(null, { path: CONFIG, env: 'test' }), ['ie 11', 'ie 10'])
})

test('uses env options to package.json', () => {
  equal(browserslist(null, { path: PACKAGE, env: 'production' }), ['ie 9', 'opera 41'])

  equal(browserslist(null, { path: PACKAGE, env: 'development' }), ['chrome 55', 'firefox 50'])

  equal(browserslist(null, { path: PACKAGE, env: 'test' }), DEFAULTS)
})

test('uses NODE_ENV to get environment', () => {
  process.env.NODE_ENV = 'test'
  equal(browserslist(null, { path: CONFIG }), ['ie 11', 'ie 10'])
})

test('uses BROWSERSLIST_ENV to get environment', () => {
  process.env.BROWSERSLIST_ENV = 'development'
  equal(browserslist(null, { path: CONFIG }), ['chrome 55', 'firefox 50'])
})

test('uses production environment by default', () => {
  delete process.env.NODE_ENV
  equal(browserslist(null, { path: CONFIG }), ['ie 9', 'opera 41'])
})

test('correctly works with not and one-version browsers', () => {
  equal(browserslist('last 1 Baidu version, not <2% in AT'), ['baidu 7.12'])
})

test.run()
