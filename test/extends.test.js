var path = require('path')
var fs = require('fs-extra')

var browserslist = require('../')

var mocked = []

function mock (name, exports) {
  var dir = path.join(__dirname, '..', 'node_modules', name)
  mocked.push(dir)
  return fs.ensureDir(dir).then(() => {
    var content = 'module.exports = ' + JSON.stringify(exports)
    return fs.writeFile(path.join(dir, 'index.js'), content)
  })
}

afterEach(() => {
  return Promise.all(mocked.map(dir => fs.remove(dir))).then(() => {
    mocked = []
  })
})

it('uses package', () => {
  return mock('browserslist-config-test', ['ie 11']).then(() => {
    var result = browserslist(['extends browserslist-config-test', 'edge 12'])
    expect(result).toEqual(['edge 12', 'ie 11'])
  })
})

it('uses file in package', () => {
  return mock('browserslist-config-test/ie', ['ie 11']).then(() => {
    var result = browserslist(['extends browserslist-config-test/ie'])
    expect(result).toEqual(['ie 11'])
  })
})

it('works with non-prefixed package with dangerousExtend', () => {
  return mock('pkg', ['ie 11']).then(() => {
    var result = browserslist(['extends pkg', 'edge 12'], {
      dangerousExtend: true
    })
    expect(result).toEqual(['edge 12', 'ie 11'])
  })
})

it('handles scoped packages', () => {
  return mock('@scope/browserslist-config-test', ['ie 11']).then(() => {
    var result = browserslist(['extends @scope/browserslist-config-test'])
    expect(result).toEqual(['ie 11'])
  })
})

it('handles file in scoped packages', () => {
  return mock('@scope/browserslist-config-test/ie', ['ie 11']).then(() => {
    var result = browserslist(['extends @scope/browserslist-config-test/ie'])
    expect(result).toEqual(['ie 11'])
  })
})

it('handles scoped packages when package is @scope/browserslist-config', () => {
  return mock('@scope/browserslist-config', ['ie 11']).then(() => {
    var result = browserslist(['extends @scope/browserslist-config'])
    expect(result).toEqual(['ie 11'])
  })
})

it('recursively imports configs', () => {
  return Promise.all([
    mock('browserslist-config-a', ['extends browserslist-config-b', 'ie 9']),
    mock('browserslist-config-b', ['ie 10'])
  ]).then(() => {
    var result = browserslist(['extends browserslist-config-a'])
    expect(result).toEqual(['ie 10', 'ie 9'])
  })
})

it('handles relative queries in external packages with local overrides', () => {
  return mock('browserslist-config-rel', ['ie 9-10']).then(() => {
    var result = browserslist(['extends browserslist-config-rel', 'not ie 9'])
    expect(result).toEqual(['ie 10'])
  })
})

it('throws when external package does not resolve to an array', () => {
  return mock('browserslist-config-wrong', { not: 'an array' }).then(() => {
    expect(() => {
      browserslist(['extends browserslist-config-wrong'])
    }).toThrowError(/not an array/)
  })
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
