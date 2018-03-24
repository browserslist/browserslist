var browserslist = require('../')

var path = require('path')

var RC = path.join(__dirname, 'fixtures', 'rc', 'test.css')
var FILE = path.join(__dirname, 'fixtures', 'dir', 'test.css')
var TYPO = path.join(__dirname, 'fixtures', 'typo', 'test.css')
var BOTH1 = path.join(__dirname, 'fixtures', 'both1', 'test.css')
var BOTH2 = path.join(__dirname, 'fixtures', 'both2', 'test.css')
var BOTH3 = path.join(__dirname, 'fixtures', 'both3', 'test.css')
var WRONG1 = path.join(__dirname, 'fixtures', 'wrong1', 'test.css')
var WRONG2 = path.join(__dirname, 'fixtures', 'wrong2', 'test.css')
var BROKEN = path.join(__dirname, 'fixtures', 'broken', 'test.css')
var PACKAGE = path.join(__dirname, 'fixtures', 'package', 'test.css')

var originCwd = process.cwd()
afterEach(function () {
  process.chdir(originCwd)
})

it('parses queries', () => {
  expect(browserslist.parseConfig('ie 10\n> 1%')).toEqual({
    defaults: ['ie 10', '> 1%']
  })
})

it('removes comments', () => {
  var config = '# support list\nie 10#bad\n> 1%'
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

it('throws on dublicate sections', () => {
  var config = '[test]\nie 10\n[production test]\nie 11'
  expect(() => {
    browserslist.parseConfig(config)
  }).toThrowError(/Dublicate section test in Browserslist config/)
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
  console.warn = jest.fn()
  expect(browserslist.findConfig(BROKEN)).toEqual({
    defaults: ['ie 11', 'ie 10']
  })
  expect(console.warn).toBeCalled()
})

it('shows error on key typo', () => {
  expect(() => {
    browserslist.findConfig(TYPO)
  }).toThrowError(/browserlist/)
})

it('reads from dir wich contains both browserslist and package.json', () => {
  expect(() => {
    browserslist.findConfig(BOTH1)
  }).toThrowError(/contains both browserslist and package\.json/)
})

it('reads from dir wich contains both .browserslistrc and package.json', () => {
  expect(() => {
    browserslist.findConfig(BOTH2)
  }).toThrowError(/contains both .browserslistrc and package\.json/)
})

it('reads from dir wich contains both .browserslistrc and browserslist', () => {
  expect(() => {
    browserslist.findConfig(BOTH3)
  }).toThrowError(/contains both .browserslistrc and browserslist/)
})

it('checks config format', () => {
  expect(() => {
    browserslist.findConfig(WRONG1)
  }).toThrowError(/Browserslist config should contain/)
  expect(() => {
    browserslist.findConfig(WRONG2)
  }).toThrowError(/Browserslist config should contain/)
})
