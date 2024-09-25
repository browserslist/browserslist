let { join } = require('path')
let { test } = require('uvu')
let { is, equal, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let RC = join(__dirname, 'fixtures', 'rc', 'test.css')
let FILE = join(__dirname, 'fixtures', 'dir', 'test.css')
let TYPO = join(__dirname, 'fixtures', 'typo', 'test.css')
let BOTH1 = join(__dirname, 'fixtures', 'both1', 'test.css')
let BOTH2 = join(__dirname, 'fixtures', 'both2', 'test.css')
let BOTH3 = join(__dirname, 'fixtures', 'both3', 'test.css')
let WRONG1 = join(__dirname, 'fixtures', 'wrong1', 'test.css')
let WRONG2 = join(__dirname, 'fixtures', 'wrong2', 'test.css')
let BROKEN = join(__dirname, 'fixtures', 'broken', 'test.css')
let STRING = join(__dirname, 'fixtures', 'string', 'test.css')
let PACKAGE = join(__dirname, 'fixtures', 'package', 'test.css')

let originWarn = console.warn
let warnCallCount = 0
test.before.each(() => {
  warnCallCount = 0
  console.warn = () => {
    warnCallCount++
    return true
  }
})

let originCwd = process.cwd()
test.after.each(() => {
  process.chdir(originCwd)
  console.warn = originWarn
})

test('parses queries', () => {
  equal(
    browserslist.parseConfig('ie 10\n> 1%'),
    { defaults: ['ie 10', '> 1%'] }
  )
})

test('parses comma', () => {
  equal(
    browserslist.parseConfig('ie 10, > 1%'),
    { defaults: ['ie 10', '> 1%'] }
  )
})

test('removes comments', () => {
  let config = '# support list\nie 10#bad\n> 1%'
  equal(
    browserslist.parseConfig(config),
    { defaults: ['ie 10', '> 1%'] }
  )
})

test('supports sections', () => {
  equal(
    browserslist.parseConfig('ie 10\n[test]\nie 11'),
    { defaults: ['ie 10'], test: ['ie 11'] }
  )
})

test('throws on duplicate sections', () => {
  let config = '[test]\nie 10\n[production test]\nie 11'
  throws(() => { browserslist.parseConfig(config) }, /Duplicate section test in Browserslist config/)
})

test('trims whitespaces', () => {
  equal(
    browserslist.parseConfig('ie 9\n\n [ test] \n \n  > 1%\n'),
    { defaults: ['ie 9'], test: ['> 1%'] }
  )
})

test('returns undefined on no config', () => {
  equal(browserslist.findConfig(__dirname), undefined)
})

test('findConfigFile returns undefined on no config', () => {
  equal(browserslist.findConfigFile(__dirname), undefined)
})

test('reads config', () => {
  equal(browserslist.findConfig(FILE), { defaults: ['ie 11', 'ie 10'] })
})

test('findConfigFile returns browserslist', () => {
  equal(browserslist.findConfigFile(FILE), join(__dirname, 'fixtures', 'browserslist'))
})

test('reads .browserslistrc config', () => {
  equal(browserslist.findConfig(RC), { defaults: ['ie 11'] })
})

test('findConfigFile returns .browserslistrc config', () => {
  equal(browserslist.findConfigFile(RC), join(__dirname, 'fixtures', 'rc', '.browserslistrc'))
})

test('reads config from package.json', () => {
  equal(browserslist.findConfig(PACKAGE), { defaults: ['ie 9', 'ie 10'] })
})

test('findConfigFile returns package.json', () => {
  equal(browserslist.findConfigFile(PACKAGE), join(__dirname, 'fixtures', 'package', 'package.json'))
})

test('shows warning on broken package.json', () => {
  equal(browserslist.findConfig(BROKEN), { defaults: ['ie 11', 'ie 10'] })
  is(warnCallCount, 1)
})

test('shows error on key typo', () => {
  throws(() => { browserslist.findConfig(TYPO) }, /browserlist/)
})

test('reads from dir wich contains both browserslist and package.json', () => {
  throws(() => { browserslist.findConfig(BOTH1) }, /contains both browserslist and package\.json/)
})

test('reads from dir wich contains both .browserslistrc and package.json', () => {
  throws(() => { browserslist.findConfig(BOTH2) }, /contains both .browserslistrc and package\.json/)
})

test('reads from dir wich contains both .browserslistrc and browserslist', () => {
  throws(() => { browserslist.findConfig(BOTH3) }, /contains both .browserslistrc and browserslist/)
})

test('checks config format', () => {
  throws(() => { browserslist.findConfig(WRONG1) }, /Browserslist config should/)
  throws(() => { browserslist.findConfig(WRONG2) }, /Browserslist config should/)
})

test('reads config with one string', () => {
  equal(browserslist.findConfig(STRING), { defaults: 'ie 9, ie 8' })
})

test('stops at ROOT', () => {
  browserslist.clearCaches()
  process.env.BROWSERSLIST_ROOT_PATH = join(__dirname, 'fixtures', 'dir')
  equal(browserslist.findConfig(FILE), undefined)
})

test('allows up to ROOT', () => {
  browserslist.clearCaches()
  process.env.BROWSERSLIST_ROOT_PATH = join(__dirname, 'fixtures')
  equal(browserslist.findConfig(FILE), { defaults: ['ie 11', 'ie 10'] })
})

test.run()
