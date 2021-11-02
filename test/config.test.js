let { join } = require('path')

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

let originCwd = process.cwd()
afterEach(() => {
  process.chdir(originCwd)
})

it('parses queries', () => {
  expect(browserslist.parseConfig('ie 10\n> 1%')).toEqual({
    defaults: ['ie 10', '> 1%']
  })
})

it('parses comma', () => {
  expect(browserslist.parseConfig('ie 10, > 1%')).toEqual({
    defaults: ['ie 10', '> 1%']
  })
})

it('removes comments', () => {
  let config = '# support list\nie 10#bad\n> 1%'
  expect(browserslist.parseConfig(config)).toEqual({
    defaults: ['ie 10', '> 1%']
  })
})

it('supports sections', () => {
  expect(browserslist.parseConfig('ie 10\n[test]\nie 11')).toEqual({
    defaults: ['ie 10'],
    test: ['ie 11']
  })
})

it('throws on duplicate sections', () => {
  let config = '[test]\nie 10\n[production test]\nie 11'
  expect(() => {
    browserslist.parseConfig(config)
  }).toThrow(/Duplicate section test in Browserslist config/)
})

it('trims whitespaces', () => {
  expect(browserslist.parseConfig('ie 9\n\n [ test] \n \n  > 1%\n')).toEqual({
    defaults: ['ie 9'],
    test: ['> 1%']
  })
})

it('returns undefined on no config', () => {
  expect(browserslist.findConfig(__dirname)).not.toBeDefined()
})

it('reads config', () => {
  expect(browserslist.findConfig(FILE)).toEqual({
    defaults: ['ie 11', 'ie 10']
  })
})

it('reads .browserslistrc config', () => {
  expect(browserslist.findConfig(RC)).toEqual({
    defaults: ['ie 11']
  })
})

it('reads config from package.json', () => {
  expect(browserslist.findConfig(PACKAGE)).toEqual({
    defaults: ['ie 9', 'ie 10']
  })
})

it('shows warning on broken package.json', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  expect(browserslist.findConfig(BROKEN)).toEqual({
    defaults: ['ie 11', 'ie 10']
  })
  expect(console.warn).toHaveBeenCalledTimes(1)
})

it('shows error on key typo', () => {
  expect(() => {
    browserslist.findConfig(TYPO)
  }).toThrow(/browserlist/)
})

it('reads from dir wich contains both browserslist and package.json', () => {
  expect(() => {
    browserslist.findConfig(BOTH1)
  }).toThrow(/contains both browserslist and package\.json/)
})

it('reads from dir wich contains both .browserslistrc and package.json', () => {
  expect(() => {
    browserslist.findConfig(BOTH2)
  }).toThrow(/contains both .browserslistrc and package\.json/)
})

it('reads from dir wich contains both .browserslistrc and browserslist', () => {
  expect(() => {
    browserslist.findConfig(BOTH3)
  }).toThrow(/contains both .browserslistrc and browserslist/)
})

it('checks config format', () => {
  expect(() => {
    browserslist.findConfig(WRONG1)
  }).toThrow(/Browserslist config should/)
  expect(() => {
    browserslist.findConfig(WRONG2)
  }).toThrow(/Browserslist config should/)
})

it('reads config with one string', () => {
  expect(browserslist.findConfig(STRING)).toEqual({
    defaults: 'ie 9, ie 8'
  })
})
