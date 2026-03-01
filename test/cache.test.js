let { writeFile, remove, mkdir } = require('fs-extra')
let { tmpdir } = require('os')
let { join } = require('path')
let { test } = require('uvu')
let { equal, not } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let DIR = join(tmpdir(), 'browserslist-' + Math.random())
let CONFIG = join(DIR, 'browserslist')

test.before(async () => {
  await mkdir(DIR)
})

test.after.each(() => {
  browserslist.clearCaches()
  delete process.env.BROWSERSLIST_DISABLE_CACHE
})

test.after(async () => {
  await Promise.all([remove(CONFIG), remove(DIR)])
})

test('caches configuration but the cache is clearable', async () => {
  await writeFile(CONFIG, 'ie 8', 'UTF-8')
  let result1 = browserslist.findConfig(DIR)

  await writeFile(CONFIG, 'chrome 56', 'UTF-8')
  let result2 = browserslist.findConfig(DIR)

  equal(result1, result2)

  browserslist.clearCaches()
  let result3 = browserslist.findConfig(DIR)
  not.equal(result1, result3)
})

test('does not use cache when ENV variable set', async () => {
  process.env.BROWSERSLIST_DISABLE_CACHE = '1'

  await writeFile(CONFIG, 'ie 8', 'UTF-8')
  let result1 = browserslist.findConfig(DIR)

  await writeFile(CONFIG, 'chrome 56', 'UTF-8')
  let result2 = browserslist.findConfig(DIR)

  not.equal(result1, result2)
})

test.run()
