let { test } = require('uvu')
let { equal } = require('uvu/assert')

let BrowserslistError = require('../error')

let originCapture = Error.captureStackTrace
test.after.each(() => {
  Error.captureStackTrace = originCapture
})

test('sets stack', () => {
  let error = new BrowserslistError('test')
  equal(typeof error.stack, 'string')
})

test('works in Firefox', () => {
  Error.captureStackTrace = undefined
  let error = new BrowserslistError('test')
  equal(error.stack, undefined)
})

test.run()
