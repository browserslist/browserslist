var browserslist = require('../')
var path = require('path')

var originData = browserslist.data

beforeEach(() => {
  jest.resetModules()
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11']
    },
    edge: {
      name: 'edge',
      released: ['12'],
      versions: ['12', '13']
    },
    chrome: {
      name: 'chrome',
      released: ['37', '38', '39'],
      versions: ['37', '38', '39', '40']
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

function mock (packageName, exports) {
  jest.doMock(packageName, () => exports, { virtual: true })
}

it('merges in external packages with "extends" queries', () => {
  mock('external-package', ['ie 11'])
  expect(browserslist(['extends external-package', 'edge 12'])).toEqual([
    'edge 12',
    'ie 11'
  ])
})

it('handles multiple external packages', () => {
  mock('external-package', ['ie 11'])
  mock('another-package', ['edge >= 12', 'unreleased edge versions'])
  expect(
    browserslist([
      'last 2 Chrome versions',
      'extends external-package',
      'extends another-package'
    ])
  ).toEqual(['chrome 39', 'chrome 38', 'edge 13', 'edge 12', 'ie 11'])
})

it('handles scoped packages', () => {
  mock('@scope/external-package', ['ie 11'])
  expect(browserslist(['extends @scope/external-package'])).toEqual(['ie 11'])
})

it('recursively imports external packages', () => {
  mock('external-package', ['extends another-one', 'ie 9-11'])
  mock('another-one', ['edge 12', 'unreleased chrome versions'])
  expect(browserslist(['extends external-package'])).toEqual([
    'chrome 40',
    'edge 12',
    'ie 11',
    'ie 10',
    'ie 9'
  ])
})

it('resolves absolute packages', () => {
  var absolutePath = path.join(__dirname, 'fixtures/external/file.js')
  var result = browserslist(['extends ' + absolutePath])
  expect(result).toEqual(['ie 11'])
})

it('handles relative queries in external packages with local overrides', () => {
  mock('external-package', ['last 2 version'])
  var result = browserslist(['extends external-package', 'not ie 9-10'])
  expect(result).toEqual([
    'chrome 39',
    'chrome 38',
    'edge 12',
    'ie 11'
  ])
})

it('handles external packages with `not` queries', () => {
  mock('external-package', ['last 3 versions', 'not ie 10'])
  var result = browserslist(['extends external-package', 'not chrome 37'])
  expect(result).toEqual([
    'chrome 39',
    'chrome 38',
    'edge 12',
    'ie 11',
    'ie 9'
  ])
})

it('throws when external package does not resolve', () => {
  expect(() =>
    browserslist(['extends package-that-does-not-exist'])
  ).toThrowError(
    'Could not extend "package-that-does-not-exist" ' +
    'because it could not be resolved'
  )
})

it('throws when external package does not resolve to an array', () => {
  mock('external-package', { not: 'an array' })
  expect(() =>
    browserslist(['extends external-package'])
  ).toThrowError(
    'Could not extend "external-package" ' +
    'because it did not export an array of queries'
  )
})
