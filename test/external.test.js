var browserslist = require('../')
var path = require('path')

beforeEach(jest.resetModules)

function mock (packageName, exports) {
  jest.doMock(packageName, () => exports, { virtual: true })
}

it('merges in external packages with "use" queries', () => {
  mock('external-package', ['ie 11'])
  expect(browserslist(['use external-package', 'firefox 10'])).toEqual([
    'firefox 10',
    'ie 11'
  ])
})

it('handles multiple external packages', () => {
  mock('external-package', ['ie 11'])
  mock('another-package', ['chrome 54'])
  expect(
    browserslist(['firefox 10', 'use external-package', 'use another-package'])
  ).toEqual(['chrome 54', 'firefox 10', 'ie 11'])
})

it('handles scoped packages', () => {
  mock('@scope/external-package', ['ie 11'])
  expect(browserslist(['use @scope/external-package'])).toEqual(['ie 11'])
})

it('recursively imports external packages', () => {
  mock('external-package', ['use thing', 'safari 5'])
  mock('thing', ['edge 12', 'firefox 11'])
  expect(browserslist(['use external-package'])).toEqual([
    'edge 12',
    'firefox 11',
    'safari 5'
  ])
})

it('resolves absolute packages', () => {
  mock('external-package', ['use thing', 'safari 5'])
  mock('thing', ['edge 12', 'firefox 11'])
  var absolutePath = path.join(__dirname, 'fixtures/external/file.js')
  // eslint-disable-next-line security/detect-non-literal-require
  expect(browserslist(['use ' + absolutePath])).toEqual(require(absolutePath))
})

it('skips external packages that do not resolve', () => {
  expect(browserslist(['use package-that-does-not-exist'])).toEqual([])
})

it('skips external packages that do not resolve to an array', () => {
  mock('external-package', { not: 'an array' })
  expect(browserslist(['use external-package'])).toEqual([])
})
