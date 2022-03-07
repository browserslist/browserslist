let { test } = require('uvu')
let { ok, is } = require('uvu/assert')

let browserslist = require('..')

test('returns lint report', () => {
  let problems = browserslist.lint('last 2 versions')

  ok(problems.length > 0)
})

test('returns empty lint report', () => {
  let problems = browserslist.lint('last 100 versions, not dead')

  is(problems.length, 0)
})

test.run()
