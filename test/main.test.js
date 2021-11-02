let path = require('path')

let browserslist = require('..')

let IE = path.join(__dirname, 'fixtures', 'explorers')
let FILE = path.join(__dirname, 'fixtures', 'dir', 'test.css')
let LINK = path.join(__dirname, 'fixtures', 'symlink')
let CONFIG = path.join(__dirname, 'fixtures', 'env-config', 'test.css')
let STRING = path.join(__dirname, 'fixtures', 'string', 'package.json')
let PACKAGE = path.join(__dirname, 'fixtures', 'env-package', 'package.json')

let DEFAULTS = browserslist(browserslist.defaults)

afterEach(() => {
  process.env.NODE_ENV = 'test'
  delete process.env.BROWSERSLIST
  delete process.env.BROWSERSLIST_CONFIG
  delete process.env.BROWSERSLIST_ENV
})

it('accepts array', () => {
  expect(browserslist(['ie 11', 'ie 10'])).toEqual(['ie 11', 'ie 10'])
})

it('accepts string', () => {
  expect(browserslist('ie 11, ie 10')).toEqual(['ie 11', 'ie 10'])
})

it('trims queries', () => {
  expect(browserslist(['ie 11 ', ' ie 10'])).toEqual(['ie 11', 'ie 10'])
  expect(browserslist('ie 11 , ie 10')).toEqual(['ie 11', 'ie 10'])
})

it('does not accept non-string and non-array parameters', () => {
  expect(() => browserslist({})).toThrow(/an array or string. Got object/)
})

it('returns unique array', () => {
  expect(browserslist('ie 10, ie 10')).toEqual(['ie 10'])
})

it('returns empty result', () => {
  expect(browserslist([])).toEqual([])
  expect(browserslist('')).toEqual([])
})

it('uses environment variable on empty request', () => {
  process.env.BROWSERSLIST = 'ie 10'
  expect(browserslist(null, { path: FILE })).toEqual(['ie 10'])
})

it('reads config on no variable', () => {
  expect(browserslist(null, { path: FILE })).toEqual(['ie 11', 'ie 10'])
})

it('reads config by direct path', () => {
  expect(browserslist(null, { config: IE })).toEqual(['ie 9', 'ie 8'])
})

it('reads package.json config by direct path', () => {
  expect(browserslist(null, { config: PACKAGE, env: 'development' })).toEqual([
    'chrome 55',
    'firefox 50'
  ])
})

it('reads package.json config with one string', () => {
  expect(browserslist(null, { config: STRING })).toEqual(['ie 9', 'ie 8'])
})

it('reads config by direct path in environment variable', () => {
  process.env.BROWSERSLIST_CONFIG = IE
  expect(browserslist(null, { path: FILE })).toEqual(['ie 9', 'ie 8'])
})

it('handles undefined stats and path correctly', () => {
  let config = { stats: undefined, path: undefined }
  expect(browserslist([], config)).toEqual([])
})

it('throw a error on wrong path to config', () => {
  expect(() => {
    browserslist(null, { config: IE + '2' })
  }).toThrow(/Can't read/)
})

if (!/^win/.test(process.platform)) {
  it('reads config by symlink', () => {
    expect(browserslist(null, { config: LINK })).toEqual(['ie 9', 'ie 8'])
  })
}

it('has default selection', () => {
  expect(browserslist.defaults.length > 0).toBe(true)
})

it('uses default selection on empty request and no config', () => {
  expect(browserslist()).toEqual(DEFAULTS)
})

it('uses current dir on undefined path', () => {
  jest.spyOn(browserslist, 'loadConfig')
  expect(browserslist(undefined, { path: undefined })).toEqual(DEFAULTS)
  expect(browserslist.loadConfig).toHaveBeenCalledWith({ path: process.cwd() })
})

it('uses default selection on disabled path', () => {
  jest.spyOn(browserslist, 'loadConfig')
  expect(browserslist(null, { path: false })).toEqual(DEFAULTS)
  expect(browserslist.loadConfig).toHaveBeenCalledWith({ path: false })
})

it('raises on unknow query', () => {
  expect(() => {
    browserslist('good')
  }).toThrow('Unknown browser query `good`')
  expect(() => {
    browserslist('IE === 9')
  }).toThrow('Unknown browser query `IE === 9`')
})

it('raises on missed version', () => {
  expect(() => {
    browserslist('IE')
  }).toThrow('Specify versions in Browserslist query for browser IE')
})

it('sorts browsers', () => {
  expect(browserslist(['ff 10', 'ie 11', 'ie 6', 'ie 10', 'ff 9'])).toEqual([
    'firefox 10',
    'firefox 9',
    'ie 11',
    'ie 10',
    'ie 6'
  ])
})

it('sorts browsers with version ranges', () => {
  expect(browserslist(['ios_saf 7', 'ie 11', 'ie 6', 'ios_saf 10'])).toEqual([
    'ie 11',
    'ie 6',
    'ios_saf 10.0-10.2',
    'ios_saf 7.0-7.1'
  ])
})

it('throws custom error', () => {
  let error
  try {
    browserslist('wrong')
  } catch (e) {
    if (e instanceof Error) error = e
  }
  expect(error.name).toEqual('BrowserslistError')
  expect(typeof error.stack).toEqual('string')
})

it('excludes queries', () => {
  expect(browserslist(['ie >= 9', 'not ie 11', 'not ie 10', 'ie 10'])).toEqual([
    'ie 10',
    'ie 9'
  ])
})

it('excludes queries for 0 version', () => {
  let browsers = browserslist(['> 1% in US', 'not last 2 and_chr versions'])
  let android = browsers.filter(i => i.indexOf('and_chr ') !== -1)
  expect(android).toHaveLength(0)
})

it('excludes queries for all version', () => {
  let browsers = browserslist(['> 0% in US', 'not last 1 op_mini versions'])
  let operaMini = browsers.filter(i => i.indexOf('op_mini ') !== -1)
  expect(operaMini).toHaveLength(0)
})

it('has actual browsers list in docs', () => {
  let names = browserslist(['last 1 version']).map(i => i.split(' ')[0])
  expect(names).toEqual([
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
  ])
})

it('throws error on first exclude query', () => {
  expect(() => {
    browserslist(['not ie 11'])
  }).toThrow(
    'Write any browsers query (for instance, `defaults`) ' +
      'before `not ie 11`'
  )
})

it('cleans 0 version', () => {
  expect(browserslist(['> 0%', '> 0% in FI'])).not.toContain('and_chr 0')
})

it('uses env options to browserlist config', () => {
  expect(browserslist(null, { path: CONFIG, env: 'production' })).toEqual([
    'ie 9',
    'opera 41'
  ])

  expect(browserslist(null, { path: CONFIG, env: 'staging' })).toEqual([
    'ie 9',
    'opera 41'
  ])

  expect(browserslist(null, { path: CONFIG, env: 'development' })).toEqual([
    'chrome 55',
    'firefox 50'
  ])

  expect(browserslist(null, { path: CONFIG, env: 'test' })).toEqual([
    'ie 11',
    'ie 10'
  ])
})

it('uses env options to package.json', () => {
  expect(browserslist(null, { path: PACKAGE, env: 'production' })).toEqual([
    'ie 9',
    'opera 41'
  ])

  expect(browserslist(null, { path: PACKAGE, env: 'development' })).toEqual([
    'chrome 55',
    'firefox 50'
  ])

  expect(browserslist(null, { path: PACKAGE, env: 'test' })).toEqual(DEFAULTS)
})

it('uses NODE_ENV to get environment', () => {
  process.env.NODE_ENV = 'test'
  expect(browserslist(null, { path: CONFIG })).toEqual(['ie 11', 'ie 10'])
})

it('uses BROWSERSLIST_ENV to get environment', () => {
  process.env.BROWSERSLIST_ENV = 'development'
  expect(browserslist(null, { path: CONFIG })).toEqual([
    'chrome 55',
    'firefox 50'
  ])
})

it('uses production environment by default', () => {
  delete process.env.NODE_ENV
  expect(browserslist(null, { path: CONFIG })).toEqual(['ie 9', 'opera 41'])
})

it('correctly works with not and one-version browsers', () => {
  expect(browserslist('last 1 Baidu version, not <2% in AT')).toHaveLength(0)
})
