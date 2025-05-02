let { ensureDir, writeFile, remove } = require('fs-extra')
let { join } = require('path')
let { test } = require('uvu')
let { equal, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let mocked = []

async function mock(name, exports, file) {
  if (!file) file = 'index.js'
  let dir = join(__dirname, '..', 'node_modules', name)
  mocked.push(dir)
  await ensureDir(dir)
  let content = 'module.exports = ' + JSON.stringify(exports)
  await writeFile(join(dir, file), content)
}

test.after.each(async () => {
  await Promise.all(mocked.map(dir => remove(dir)))
  mocked = []
  delete process.env.BROWSERSLIST_DANGEROUS_EXTEND
})

test('uses package', async () => {
  await mock('browserslist-config-test', ['ie 11'])
  let result = browserslist(['extends browserslist-config-test', 'ie 6'])
  equal(result, ['ie 11', 'ie 6'])
})

test('uses ESM package', async () => {
  await mock('browserslist-config-test', ['ie 11'], 'index.mjs')
  let result = browserslist(['extends browserslist-config-test', 'ie 6'])
  equal(result, ['ie 11', 'ie 6'])
})

test('uses file in package', async () => {
  await mock('browserslist-config-test/ie', ['ie 11'])
  let result = browserslist(['extends browserslist-config-test/ie'])
  equal(result, ['ie 11'])
})

test('works with non-prefixed package with dangerousExtend', async () => {
  await mock('pkg', ['ie 11'])
  let result = browserslist(['extends pkg', 'edge 12'], {
    dangerousExtend: true
  })
  equal(result, ['edge 12', 'ie 11'])
})

test('supports BROWSERSLIST_DANGEROUS_EXTEND', async () => {
  process.env.BROWSERSLIST_DANGEROUS_EXTEND = '1'
  await mock('pkg', ['ie 11'])
  let result = browserslist(['extends pkg', 'edge 12'])
  equal(result, ['edge 12', 'ie 11'])
})

test('handles scoped packages', async () => {
  await mock('@scope/browserslist-config-test', ['ie 11'])
  let result = browserslist(['extends @scope/browserslist-config-test'])
  equal(result, ['ie 11'])
})

test('handles scoped packages with a dot in the name', async () => {
  await mock('@example.com/browserslist-config-test', ['ie 11'])
  let result = browserslist(['extends @example.com/browserslist-config-test'])
  equal(result, ['ie 11'])
})

test('handles file in scoped packages', async () => {
  await mock('@scope/browserslist-config-test/ie', ['ie 11'])
  let result = browserslist(['extends @scope/browserslist-config-test/ie'])
  equal(result, ['ie 11'])
})

test('handles file-less scoped packages', async () => {
  await mock('@scope/browserslist-config', ['ie 11'])
  let result = browserslist(['extends @scope/browserslist-config'])
  equal(result, ['ie 11'])
})

test('recursively imports configs', async () => {
  await Promise.all([
    mock('browserslist-config-a', ['extends browserslist-config-b', 'ie 9']),
    mock('browserslist-config-b', ['ie 10'])
  ])
  let result = browserslist(['extends browserslist-config-a'])
  equal(result, ['ie 10', 'ie 9'])
})

test('handles relative queries with local overrides', async () => {
  await mock('browserslist-config-rel', ['ie 9-10'])
  let result = browserslist(['extends browserslist-config-rel', 'not ie 9'])
  equal(result, ['ie 10'])
})

test('throws on external package with empty export', async () => {
  await mock('browserslist-config-wrong', 'some string')
  throws(
    () => browserslist(['extends browserslist-config-wrong']),
    /not an array of queries or an object/
  )
})

test('throws when package does not have browserslist-config- prefix', () => {
  throws(
    () => browserslist(['extends thing-without-prefix']),
    /needs `browserslist-config-` prefix/
  )
})

test('throws when extends package has dot in path', () => {
  throws(
    () => browserslist(['extends browserslist-config-package/../something']),
    /`.` not allowed/
  )
})

test('throws when extends package has node_modules in path', () => {
  throws(
    () => browserslist(['extends browserslist-config-test/node_modules/a']),
    /`node_modules` not allowed/
  )
})

test("works with shareable config doesn't contains defaults env", async () => {
  await mock('browserslist-config-with-env-a', {
    someEnv: ['ie 10']
  })
  let result = browserslist(['extends browserslist-config-with-env-a'])
  equal(result, [])
})

test('works with shareable config contains env', async () => {
  process.env.NODE_ENV = 'someEnv'
  await mock('browserslist-config-with-env-b', {
    someEnv: ['ie 10']
  })
  let result = browserslist(['extends browserslist-config-with-env-b'])
  equal(result, ['ie 10'])
})

test('works with shareable config contains defaults env', async () => {
  await mock('browserslist-config-with-defaults', {
    defaults: ['ie 10']
  })
  let result = browserslist(['extends browserslist-config-with-defaults'])
  equal(result, ['ie 10'])
})

test('throws when external package resolve to nullable', async () => {
  await mock('browserslist-config-null', null)
  throws(
    () => browserslist(['extends browserslist-config-null']),
    /config exports not an array/
  )
})

test.run()
