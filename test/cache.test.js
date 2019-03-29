var path = require('path')
var os = require('os')
var fs = require('fs')

var browserslist = require('../')

var DIR = path.join(os.tmpdir(), 'browserslist-' + Math.random())
var CONFIG = path.join(DIR, 'browserslist')

beforeAll(() => {
  fs.mkdirSync(DIR)
})

afterEach(() => {
  browserslist.clearCaches()
  delete process.env.BROWSERSLIST_DISABLE_CACHE
})

afterAll(() => {
  fs.unlinkSync(CONFIG)
  fs.rmdirSync(DIR)
})

it('caches configuration but the cache is clearable', () => {
  fs.writeFileSync(CONFIG, 'ie 8', 'UTF-8')
  var result1 = browserslist.findConfig(DIR)

  fs.writeFileSync(CONFIG, 'chrome 56', 'UTF-8')
  var result2 = browserslist.findConfig(DIR)

  expect(result1).toEqual(result2)

  browserslist.clearCaches()
  var result3 = browserslist.findConfig(DIR)
  expect(result1).not.toEqual(result3)
})

it('does not use cache when ENV variable set', () => {
  process.env.BROWSERSLIST_DISABLE_CACHE = 1

  fs.writeFileSync(CONFIG, 'ie 8', 'UTF-8')
  var result1 = browserslist.findConfig(DIR)

  fs.writeFileSync(CONFIG, 'chrome 56', 'UTF-8')
  var result2 = browserslist.findConfig(DIR)

  expect(result1).not.toEqual(result2)
})
