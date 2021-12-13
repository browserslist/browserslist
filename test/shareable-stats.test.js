let { test } = require('uvu')
let { equal, throws } = require('uvu/assert')
let { ensureDir, writeFile, remove } = require('fs-extra')
let { join } = require('path')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let STATS = join(__dirname, 'fixtures', 'browserslist-stats.json')
let CUSTOM_STATS = join(__dirname, 'fixtures', 'stats.json')

let mocked = []

async function mock(name, index, stats) {
  let dir = join(__dirname, '..', 'node_modules', name)
  mocked.push(dir)
  await ensureDir(dir)
  if (index) {
    let content = 'module.exports = ' + JSON.stringify(index)
    await writeFile(join(dir, 'index.js'), content)
  }
  if (stats) {
    let statsContent = JSON.stringify(stats)
    await writeFile(join(dir, 'browserslist-stats.json'), statsContent)
  }
}

test.after.each(async () => {
  await Promise.all(mocked.map(dir => remove(dir)))
  mocked = []
  delete process.env.BROWSERSLIST_STATS
})

test('takes stats from shareable config', async () => {
  await mock('browserslist-config-test1', undefined, {
    dataByBrowser: { chrome: { 55: 4, 56: 6 } }
  })
  equal(browserslist('> 5% in browserslist-config-test1 stats'), ['chrome 56'])
})

test('takes stats and queries from shareable config', async () => {
  await mock(
    'browserslist-config-test2',
    ['> 1% in browserslist-config-test2 stats'],
    { ie: { 8: 1, 11: 2 } }
  )
  equal(browserslist('extends browserslist-config-test2'), ['ie 11'])
})

test('ignores null usage value', async () => {
  await mock(
    'browserslist-config-null-test',
    undefined,
    { chrome: { 90: 3, 999: null } }
  )
  equal(browserslist('< 5% in browserslist-config-null-test stats'), ['chrome 90'])
})

test('works with non-prefixed stats with dangerousExtend', async () => {
  await mock('pkg', undefined, { chrome: { 78: 6 } })
  equal(
    browserslist(['> 5% in pkg stats'], { dangerousExtend: true }),
    ['chrome 78']
  )
})

test('handles scoped stats with a dot in the name', async () => {
  await mock('@example.com/browserslist-config', undefined, {
    ie: { 8: 5, 11: 4 }
  })
  equal(
    browserslist(['< 5% in @example.com/browserslist-config stats']),
    ['ie 11']
  )
})

test('handles file in scoped stats', async () => {
  await mock('@scope/browserslist-config/ie', undefined, {
    ie: { 8: 2, 11: 5 }
  })
  equal(
    browserslist(['>= 5% in @scope/browserslist-config/ie stats']),
    ['ie 11']
  )
})

test('handles file-less scoped stats', async () => {
  await mock('@scope/browserslist-config', undefined, { ie: { 8: 6, 11: 5 } })
  equal(browserslist(['<= 5% in @scope/browserslist-config stats']), ['ie 11'])
})

test('handles scoped stats', async () => {
  await mock('@scope/browserslist-config-test', undefined, {
    ie: { 8: 2, 11: 6 }
  })
  equal(browserslist(['> 5% in @scope/browserslist-config-test stats']), ['ie 11'])
})

test('ignores passed stats', () => {
  throws(
    () => browserslist('> 5% in browserslist-config-test3 stats', { stats: STATS }),
    /Cannot (find|resolve) module/
  )
})

test('ignores environment variable stats', () => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  throws(() => browserslist('> 5% in browserslist-config-test4 stats'), /Cannot (find|resolve) module/)
})

test('throws when stats does not have browserslist-config- prefix', () => {
  throws(
    () => { browserslist(['> 5% in thing-without-prefix stats'])},
    /needs `browserslist-config-` prefix/
  )
})

test('throws when stats has dot in path', () => {
  throws(() => browserslist(['> 5% in browserslist-config-package/../something stats']), /`.` not allowed/)
})

test('throws when stats has node_modules in path', () => {
  throws(
    () => browserslist(['> 5% in browserslist-config-test/node_modules/a stats']),
    /`node_modules` not allowed/
  )
})

test('throw if stats undefined', async () => {
  await mock(
    'browserslist-config-undefined',
    undefined,
    // @ts-expect-error
    { dataByBrowser: 'not object' }
  )
  throws(() =>
    browserslist(['> 5% in browserslist-config-undefined stats']),
    /statistics was not provided/
  )
})

test.run()
