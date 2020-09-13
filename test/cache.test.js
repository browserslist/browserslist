let { writeFile, remove, mkdir } = require('fs-extra')
let { tmpdir } = require('os')
let { join } = require('path')

let browserslist = require('../')

let DIR = join(tmpdir(), 'browserslist-' + Math.random())
let CONFIG = join(DIR, 'browserslist')
let PACKAGE = join(DIR, 'package.json')

beforeAll(async () => {
  await mkdir(DIR)
})

afterEach(() => {
  browserslist.clearCaches()
  delete process.env.BROWSERSLIST_DISABLE_CACHE
})

afterAll(async () => {
  await Promise.all([
    remove(CONFIG),
    remove(DIR)
  ])
})

it('caches configuration but the cache is clearable', async () => {
  await writeFile(CONFIG, 'ie 8', 'UTF-8')
  let result1 = browserslist.findConfig(DIR)

  await writeFile(CONFIG, 'chrome 56', 'UTF-8')
  let result2 = browserslist.findConfig(DIR)

  expect(result1).toEqual(result2)

  browserslist.clearCaches()
  let result3 = browserslist.findConfig(DIR)
  expect(result1).not.toEqual(result3)
})

it('does not use cache when ENV variable set', async () => {
  process.env.BROWSERSLIST_DISABLE_CACHE = 1

  await writeFile(CONFIG, 'ie 8', 'UTF-8')
  let result1 = browserslist.findConfig(DIR)

  await writeFile(CONFIG, 'chrome 56', 'UTF-8')
  let result2 = browserslist.findConfig(DIR)

  expect(result1).not.toEqual(result2)
})

it('caches dependencies but the cache is clearable', async () => {
  await writeFile(PACKAGE, '{"engines":{"node": "6"}}', 'UTF-8')
  let result1 = browserslist.loadDependencies({ path: DIR })

  await writeFile(PACKAGE, '{"engines":{"node": "8"}}', 'UTF-8')
  let result2 = browserslist.loadDependencies({ path: DIR })

  expect(result1).toEqual(result2)

  browserslist.clearCaches()
  let result3 = browserslist.loadDependencies({ path: DIR })
  expect(result1).not.toEqual(result3)
})

it('does not use dependency cache when ENV variable set', async () => {
  process.env.BROWSERSLIST_DISABLE_CACHE = 1

  await writeFile(PACKAGE, '{"engines":{"node": "6"}}', 'UTF-8')
  let result1 = browserslist.loadDependencies({ path: DIR })

  await writeFile(PACKAGE, '{"engines":{"node": "8"}}', 'UTF-8')
  let result2 = browserslist.loadDependencies({ path: DIR })

  expect(result1).not.toEqual(result2)
})
