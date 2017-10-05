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

describe('dangerousExtend disabled `extends package` validation', () => {
  it('works for valid package', () => {
    mock('pkg', ['ie 11'])
    var result = browserslist(['extends pkg', 'edge 12'], {
      dangerousExtend: true
    })
    expect(result).toEqual(['edge 12', 'ie 11'])
  })

  it('works for valid package with scoped name', () => {
    mock('@scope/external-package', ['ie 11'])
    var result = browserslist([
      'extends @scope/external-package',
      'edge 12'
    ], { dangerousExtend: true })
    expect(result).toEqual(['edge 12', 'ie 11'])
  })

  it('resolves absolute packages', () => {
    var absolutePath = path.join(__dirname, 'fixtures/external/file.js')
    var result = browserslist(['extends ' + absolutePath], {
      dangerousExtend: true
    })
    expect(result).toEqual(['ie 11'])
  })
})

describe('`extends package` validation', () => {
  it('merges in external packages with "extends" queries', () => {
    mock('browserslist-config-external-package', ['ie 11'])
    var result = browserslist([
      'extends browserslist-config-external-package',
      'edge 12'
    ])
    expect(result).toEqual(['edge 12', 'ie 11'])
  })

  it('handles multiple external packages', () => {
    mock('browserslist-config-external-package', ['ie 11'])
    mock('browserslist-config-another-package', [
      'edge >= 12',
      'unreleased edge versions'
    ])
    expect(
      browserslist(
        [
          'last 2 Chrome versions',
          'extends browserslist-config-external-package',
          'extends browserslist-config-another-package'
        ]
      )
    ).toEqual(['chrome 39', 'chrome 38', 'edge 13', 'edge 12', 'ie 11'])
  })

  it('handles scoped packages', () => {
    mock('@scope/browserslist-config-pkg', ['ie 11'])
    var result = browserslist(['extends @scope/browserslist-config-pkg'])
    expect(result).toEqual(['ie 11'])
  })

  it('recursively imports external packages', () => {
    mock('browserslist-config-external-package', [
      'extends browserslist-config-another-one',
      'ie 9-11'
    ])
    mock('browserslist-config-another-one', [
      'edge 12',
      'unreleased chrome versions'
    ])
    expect(
      browserslist(['extends browserslist-config-external-package'])
    ).toEqual(['chrome 40', 'edge 12', 'ie 11', 'ie 10', 'ie 9'])
  })

  it('handles relative queries in external packages with local overrides',
    () => {
      mock('browserslist-config-external-package', ['last 2 version'])
      var result = browserslist([
        'extends browserslist-config-external-package',
        'not ie 9-10'
      ])
      expect(result).toEqual(['chrome 39', 'chrome 38', 'edge 12', 'ie 11'])
    }
  )

  it('handles external packages with `not` queries', () => {
    mock('browserslist-config-external-package', [
      'last 3 versions',
      'not ie 10'
    ])
    var result = browserslist([
      'extends browserslist-config-external-package',
      'not chrome 37'
    ])
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
      browserslist(['extends browserslist-config-package-that-does-not-exist'])
    ).toThrowError(
      'Could not extend "browserslist-config-package-that-does-not-exist" ' +
        'because it could not be resolved'
    )
  })

  it('throws when external package does not resolve to an array', () => {
    mock('browserslist-config-external-package', { not: 'an array' })
    expect(() =>
      browserslist(['extends browserslist-config-external-package'])
    ).toThrowError(
      'Could not extend "browserslist-config-external-package" ' +
        'because it did not export an array of queries'
    )
  })

  it('throws when package does not have browserslist-config- prefix', () => {
    expect(() =>
      browserslist(['extends thing-without-prefix'])
    ).toThrowError(
      'Extended package name "thing-without-prefix"' +
      ' needs `browserslist-config-` prefix.'
    )
  })

  it('throws when extends package has ".." in path',
    () => {
      expect(() =>
        browserslist(['extends ../browserslist-config-package'])
      ).toThrowError('`../` not allowed in package name.')
    })

  it('throws when extends package has "node_modules" in path',
    () => {
      expect(() =>
        browserslist(['extends node_modules/browserslist-config-package'])
      ).toThrowError('`node_modules` not allowed in package name.')
    })
})
