import { writeFile, remove, mkdir } from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'

import browserslist from '../'

let DIR = join(tmpdir(), 'browserslist-' + Math.random())
let CONFIG = join(DIR, 'browserslist')

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
  process.env.BROWSERSLIST_DISABLE_CACHE = '1'

  await writeFile(CONFIG, 'ie 8', 'UTF-8')
  let result1 = browserslist.findConfig(DIR)

  await writeFile(CONFIG, 'chrome 56', 'UTF-8')
  let result2 = browserslist.findConfig(DIR)

  expect(result1).not.toEqual(result2)
})
