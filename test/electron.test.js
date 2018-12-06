var browserslist = require('../')

it('converts Electron to Chrome', () => {
  expect(browserslist('electron 1.1')).toEqual(['chrome 50', 'node 6.1.0'])
})

it('supports case insensitive Electron name', () => {
  expect(browserslist('Electron 1.1')).toEqual(['chrome 50', 'node 6.1.0'])
})

it('knows a recent version', () => {
  expect(browserslist('electron 3.0.9')).toEqual(['chrome 66', 'node 10.2.0'])
})

it('throws on unknown Electron version', () => {
  expect(() => {
    browserslist('electron 2.1.0') // excluded, has '-unsupported' suffix
  }).toThrowError(/Unknown version/)
})

it('converts Electron to Chrome and Node in ranges', () => {
  expect(browserslist('electron 0.36-1.2')).toEqual([
    'chrome 51', 'chrome 50', 'chrome 49', 'chrome 47',
    'node 6.1.0', 'node 6.0.0-pre', 'node 5.10.0', 'node 5.1.1'])
})

it('ignores case in Electron ranges', () => {
  expect(browserslist('Electron 0.37-1.0'))
    .toEqual(['chrome 49', 'node 6.0.0-pre', 'node 5.10.0', 'node 5.1.1'])
})

it('throws on unknown Electron range version', () => {
  expect(() => {
    browserslist('electron 0.1-1.2')
  }).toThrowError(/Unknown version/)
  expect(() => {
    browserslist('electron 0.37-999')
  }).toThrowError(/Unknown version/)
})

it('converts Electron versions to Chrome and Node', () => {
  expect(browserslist('electron <= 0.21'))
    .toEqual(['chrome 40', 'chrome 39', 'node 1.0.0-pre', 'node 0.13.0-pre'])
})

it('ignores case in Electron versions', () => {
  expect(browserslist('Electron < 0.21'))
    .toEqual(['chrome 39', 'node 0.13.0-pre'])
})

it('supports last versions for Electron', () => {
  expect(browserslist('last 2 Electron versions').length)
    .toBeGreaterThanOrEqual(2)
})

it('supports last major versions for Electron', () => {
  expect(browserslist('last 2 Electron major versions').length)
    .toBeGreaterThanOrEqual(2)
})

// Unreleased

it('supports unreleased versions for Electron', () => {
  expect(browserslist('unreleased Electron versions')).toHaveLength(0)
})

// versions tests

it('selects electron by more and more or equal sign', () => {
  var at2014 = browserslist('electron 2.0.14')
  var from2014 = browserslist('electron >= 2.0') // expands to 2.0.14
  var after2014 = browserslist('electron > 2') // expands to 2.0.14
  var expectedAfter = from2014.filter(function (v) {
    // 2.0.14 is last version using these chrome/node versions:
    return v !== 'chrome 61' && v !== 'node 8.9.3'
  })

  expect(at2014).toEqual(['chrome 61', 'node 8.9.3'])
  expect(after2014).toEqual(expectedAfter)
})

it('selects electron by less sign', () => {
  var at300 = browserslist('electron 3') // expands to 3.0.0
  var until300 = browserslist('electron <= 3.0') // expands to 3.0.0
  var before300 = browserslist('electron < 3.0.0')
  var expectedBefore = until300.filter(function (v) {
    // 3.0.0 adds these versions:
    return v !== 'chrome 66' && v !== 'node 10.2.0'
  })

  expect(at300).toEqual(['chrome 66', 'node 10.2.0'])
  expect(before300).toEqual(expectedBefore)
})

it('throws on unknown Electron version in operator query', () => {
  expect(() => {
    browserslist('electron < 2.1')
  }).toThrowError(/Unknown version/)
  expect(() => {
    browserslist('electron <= 2.1.0')
  }).toThrowError(/Unknown version/)
  expect(() => {
    browserslist('electron > 2.1')
  }).toThrowError(/Unknown version/)
  expect(() => {
    browserslist('electron >= 2.1.0')
  }).toThrowError(/Unknown version/)
  expect(() => {
    browserslist('electron >= 9999')
  }).toThrowError(/Unknown version/)
})

// Edge cases for finding versions

it('selects the oldest matching version by minor version', () => {
  // 0.29 has no .0, expect 0.29.1 to be found
  expect(browserslist('Electron 0.29')).toEqual(['chrome 43', 'node 2.3.1'])
})

it('selects the newest version for major in more than sign', () => {
  expect(browserslist('electron > 2'))
    .toEqual(browserslist('electron > 2.0.14'))
})
