var browserslist = require('../')

afterEach(() => {
  jest.resetModules()
})

function mock (packageName, exports) {
  jest.doMock(packageName, () => exports, { virtual: true })
}

it('uses package', () => {
  mock('browserslist-config-test', ['ie 11'])
  var result = browserslist(['extends browserslist-config-test', 'edge 12'])
  expect(result).toEqual(['edge 12', 'ie 11'])
})

it('works with non-prefixed package with dangerousExtend', () => {
  mock('pkg', ['ie 11'])
  var result = browserslist(['extends pkg', 'edge 12'], {
    dangerousExtend: true
  })
  expect(result).toEqual(['edge 12', 'ie 11'])
})

it('handles scoped packages', () => {
  mock('@scope/browserslist-config-test', ['ie 11'])
  var result = browserslist(['extends @scope/browserslist-config-test'])
  expect(result).toEqual(['ie 11'])
})

it('handles scoped packages when package is @scope/browserslist-config', () => {
  mock('@scope/browserslist-config', ['ie 11'])
  var result = browserslist(['extends @scope/browserslist-config'])
  expect(result).toEqual(['ie 11'])
})

it('recursively imports configs', () => {
  mock('browserslist-config-one', ['extends browserslist-config-two', 'ie 9'])
  mock('browserslist-config-two', ['ie 10'])
  var result = browserslist(['extends browserslist-config-one'])
  expect(result).toEqual(['ie 10', 'ie 9'])
})

it('handles relative queries in external packages with local overrides', () => {
  mock('browserslist-config-test', ['ie 9-10'])
  var result = browserslist(['extends browserslist-config-test', 'not ie 9'])
  expect(result).toEqual(['ie 10'])
})

it('throws when external package does not resolve to an array', () => {
  mock('browserslist-config-test', { not: 'an array' })
  expect(() => {
    browserslist(['extends browserslist-config-test'])
  }).toThrowError(/not an array/)
})

it('throws when package does not have browserslist-config- prefix', () => {
  expect(() => {
    browserslist(['extends thing-without-prefix'])
  }).toThrowError(/needs `browserslist-config-` prefix/)
})

it('throws when extends package has "." in path', () => {
  expect(() => {
    browserslist(['extends browserslist-config-package/../something'])
  }).toThrowError(/`.` not allowed/)
})

it('throws when extends package has node_modules in path', () => {
  expect(() => {
    browserslist(['extends browserslist-config-test/node_modules/a'])
  }).toThrowError(/`node_modules` not allowed/)
})
