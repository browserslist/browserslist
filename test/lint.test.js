let { test } = require('uvu')
let { type } = require('uvu/assert')

let browserslist = require('..')

test('returns lint report', () => {
  let report = browserslist.lint('defaults')

  type(report, 'string')
})

test.run()
