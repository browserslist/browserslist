let { test } = require('uvu')
let { equal, throws, is } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('converts Electron to Chrome', () => {
  equal(browserslist('electron 1.1'), ['chrome 50'])
})

test('supports Electron Patch versions to Chrome', () => {
  equal(browserslist('electron 4.0.4'), ['chrome 69'])
})

test('supports case insensitive Electron name', () => {
  equal(browserslist('Electron 1.1'), ['chrome 50'])
})

test('throws on unknown Electron version', () => {
  throws(() => browserslist('electron 0.19'), /Unknown version/)
})

test('converts Electron to Chrome in ranges', () => {
  equal(
    browserslist('electron 0.36-1.2'),
    [
      'chrome 51',
      'chrome 50',
      'chrome 49',
      'chrome 47'
    ]
  )
})

test('ignores case in Electron ranges', () => {
  equal(browserslist('Electron 0.37-1.0'), ['chrome 49'])
})

test('supports patch versions in Electron ranges', () => {
  equal(browserslist('Electron 0.37.5-1.0.3'), ['chrome 49'])
})

test('throws on unknown Electron range version', () => {
  throws(() => browserslist('electron 0.1-1.2'), /Unknown version/)
  throws(() => browserslist('electron 0.37-999'), /Unknown version/)
})

test('converts Electron versions to Chrome', () => {
  equal(browserslist('electron <= 0.21'), ['chrome 41', 'chrome 39'])
})

test('ignores case in Electron versions', () => {
  equal(browserslist('Electron < 0.21'), ['chrome 39'])
})

test('converts Electron patch versions to Chrome', () => {
  equal(browserslist('Electron < 0.21.5'), ['chrome 39'])
})

test('supports last versions for Electron', () => {
  is(browserslist('last 2 Electron versions').length >= 1, true)
})

test('supports last major versions for Electron', () => {
  is(browserslist('last 2 Electron major versions').length >= 1, true)
})

test('supports unreleased versions for Electron', () => {
  is(browserslist('unreleased Electron versions').length, 0)
})

test.run()
