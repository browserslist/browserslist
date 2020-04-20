let { ensureDir, writeFile, remove } = require('fs-extra')
let { join } = require('path')

let browserslist = require('../')

let mocked = []

async function mock (name, exports) {
  let dir = join(__dirname, '..', 'node_modules', name)
  mocked.push(dir)
  await ensureDir(dir)
  let content = 'module.exports = ' + JSON.stringify(exports)
  await writeFile(join(dir, 'index.js'), content)
}

afterEach(async () => {
  await Promise.all(mocked.map(dir => remove(dir)))
  mocked = []
})

it('uses package', async () => {
  await mock('browserslist-config-test', ['ie 11'])
  let result = browserslist(['extends browserslist-config-test', 'ie 6'])
  expect(result).toEqual(['ie 11', 'ie 6'])
})

it('uses file in package', async () => {
  await mock('browserslist-config-test/ie', ['ie 11'])
  let result = browserslist(['extends browserslist-config-test/ie'])
  expect(result).toEqual(['ie 11'])
})

it('works with non-prefixed package with dangerousExtend', async () => {
  await mock('pkg', ['ie 11'])
  let result = browserslist(['extends pkg', 'edge 12'], {
    dangerousExtend: true
  })
  expect(result).toEqual(['edge 12', 'ie 11'])
})

it('handles scoped packages', async () => {
  await mock('@scope/browserslist-config-test', ['ie 11'])
  let result = browserslist(['extends @scope/browserslist-config-test'])
  expect(result).toEqual(['ie 11'])
})

it('handles scoped packages with a dot in the name', async () => {
  await mock('@example.com/browserslist-config-test', ['ie 11'])
  let result = browserslist(['extends @example.com/browserslist-config-test'])
  expect(result).toEqual(['ie 11'])
})

it('handles file in scoped packages', async () => {
  await mock('@scope/browserslist-config-test/ie', ['ie 11'])
  let result = browserslist(['extends @scope/browserslist-config-test/ie'])
  expect(result).toEqual(['ie 11'])
})

it('handles file-less scoped packages', async () => {
  await mock('@scope/browserslist-config', ['ie 11'])
  let result = browserslist(['extends @scope/browserslist-config'])
  expect(result).toEqual(['ie 11'])
})

it('recursively imports configs', async () => {
  await Promise.all([
    mock('browserslist-config-a', ['extends browserslist-config-b', 'ie 9']),
    mock('browserslist-config-b', ['ie 10'])
  ])
  let result = browserslist(['extends browserslist-config-a'])
  expect(result).toEqual(['ie 10', 'ie 9'])
})

it('handles relative queries with local overrides', async () => {
  await mock('browserslist-config-rel', ['ie 9-10'])
  let result = browserslist(['extends browserslist-config-rel', 'not ie 9'])
  expect(result).toEqual(['ie 10'])
})

it('throws when external package does not resolve to an array or an object',
  async () => {
    await mock('browserslist-config-wrong', 'some string')
    expect(() => {
      browserslist(['extends browserslist-config-wrong'])
    }).toThrow(/not an array of queries or an object/)
  })

it('throws when package does not have browserslist-config- prefix', () => {
  expect(() => {
    browserslist(['extends thing-without-prefix'])
  }).toThrow(/needs `browserslist-config-` prefix/)
})

it('throws when extends package has dot in path', () => {
  expect(() => {
    browserslist(['extends browserslist-config-package/../something'])
  }).toThrow(/`.` not allowed/)
})

it('throws when extends package has node_modules in path', () => {
  expect(() => {
    browserslist(['extends browserslist-config-test/node_modules/a'])
  }).toThrow(/`node_modules` not allowed/)
})

it('works with shareable config doesn\'t contains defaults env', async () => {
  await mock('browserslist-config-with-env-a', {
    someEnv: ['ie 10']
  })
  let result = browserslist(['extends browserslist-config-with-env-a'])
  expect(result).toEqual([])
})

it('works with shareable config contains env', async () => {
  process.env.NODE_ENV = 'someEnv'
  await mock('browserslist-config-with-env-b', {
    someEnv: ['ie 10']
  })
  let result = browserslist(['extends browserslist-config-with-env-b'])
  expect(result).toEqual(['ie 10'])
})

it('works with shareable config contains defaults env', async () => {
  await mock('browserslist-config-with-defaults', {
    defaults: ['ie 10']
  })
  let result = browserslist(['extends browserslist-config-with-defaults'])
  expect(result).toEqual(['ie 10'])
})

it('throws when external package resolve to nullable',
  async () => {
    await mock('browserslist-config-null', null)
    expect(() => {
      browserslist(['extends browserslist-config-null'])
    }).toThrow(/onfig doesn't export a configuration/)
  })
