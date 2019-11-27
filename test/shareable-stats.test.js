let { ensureDir, writeFile, remove } = require('fs-extra')
let { join } = require('path')

let browserslist = require('../')

let STATS = join(__dirname, 'fixtures', 'browserslist-stats.json')
let CUSTOM_STATS = join(__dirname, 'fixtures', 'stats.json')

let mocked = []

async function mock (name, index, stats) {
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

afterEach(async () => {
  await Promise.all(mocked.map(dir => remove(dir)))
  mocked = []
  delete process.env.BROWSERSLIST_STATS
})

it('takes stats from shareable config', async () => {
  await mock(
    'browserslist-config-test1',
    undefined,
    { dataByBrowser: { chrome: { 55: 4, 56: 6 } } }
  )
  expect(
    browserslist('> 5% in browserslist-config-test1 stats')
  ).toEqual(['chrome 56'])
})

it('takes stats and queries from shareable config', async () => {
  await mock(
    'browserslist-config-test2',
    ['> 1% in browserslist-config-test2 stats'],
    { ie: { 8: 1, 11: 2 } }
  )
  expect(
    browserslist('extends browserslist-config-test2')
  ).toEqual(['ie 11'])
})

it('works with non-prefixed stats with dangerousExtend', async () => {
  await mock('pkg', undefined, { and_chr: { 78: 6 } })
  expect(
    browserslist(['> 5% in pkg stats'], { dangerousExtend: true })
  ).toEqual(['and_chr 78'])
})

it('handles scoped stats with a dot in the name', async () => {
  await mock(
    '@example.com/browserslist-config',
    undefined,
    { ie: { 8: 5, 11: 4 } }
  )
  expect(
    browserslist(['< 5% in @example.com/browserslist-config stats'])
  ).toEqual(['ie 11'])
})

it('handles file in scoped stats', async () => {
  await mock(
    '@scope/browserslist-config/ie',
    undefined,
    { ie: { 8: 2, 11: 5 } }
  )
  expect(
    browserslist(['>= 5% in @scope/browserslist-config/ie stats'])
  ).toEqual(['ie 11'])
})

it('handles file-less scoped stats', async () => {
  await mock('@scope/browserslist-config', undefined, { ie: { 8: 6, 11: 5 } })
  expect(
    browserslist(['<= 5% in @scope/browserslist-config stats'])
  ).toEqual(['ie 11'])
})

it('handles scoped stats', async () => {
  await mock(
    '@scope/browserslist-config-test',
    undefined,
    { ie: { 8: 2, 11: 6 } }
  )
  expect(
    browserslist(['> 5% in @scope/browserslist-config-test stats'])
  ).toEqual(['ie 11'])
})

it('ignores passed stats', async () => {
  expect(
    () =>
      browserslist('> 5% in browserslist-config-test3 stats', { stats: STATS })
  ).toThrow(/Cannot resolve module/)
})

it('ignores environment variable stats', async () => {
  process.env.BROWSERSLIST_STATS = CUSTOM_STATS
  expect(
    () => browserslist('> 5% in browserslist-config-test4 stats')
  ).toThrow(/Cannot resolve module/)
})

it('throws when stats does not have browserslist-config- prefix', () => {
  expect(() => {
    browserslist(['> 5% in thing-without-prefix stats'])
  }).toThrow(/needs `browserslist-config-` prefix/)
})

it('throws when stats has dot in path', () => {
  expect(() => {
    browserslist(['> 5% in browserslist-config-package/../something stats'])
  }).toThrow(/`.` not allowed/)
})

it('throws when stats has node_modules in path', () => {
  expect(() => {
    browserslist(['> 5% in browserslist-config-test/node_modules/a stats'])
  }).toThrow(/`node_modules` not allowed/)
})

it('throw if stats undefined', async () => {
  await mock(
    'browserslist-config-undefined',
    undefined,
    { dataByBrowser: 'not object' }
  )
  expect(
    () => browserslist(['> 5% in browserslist-config-undefined stats'])
  ).toThrow(/statistics was not provided/)
})
