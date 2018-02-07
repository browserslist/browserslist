var BrowserslistError = require('../error')

var originCapture = Error.captureStackTrace
afterEach(function () {
  Error.captureStackTrace = originCapture
})

it('sets stack', function () {
  var error = new BrowserslistError('test')
  expect(typeof error.stack).toEqual('string')
})

it('works in Firefox', function () {
  Error.captureStackTrace = undefined
  var error = new BrowserslistError('test')
  expect(error.stack).toBeUndefined()
})
