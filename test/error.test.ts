import BrowserslistError from '../error'

let originCapture = Error.captureStackTrace
afterEach(() => {
  Error.captureStackTrace = originCapture
})

it('sets stack', () => {
  let error = new BrowserslistError('test')
  expect(typeof error.stack).toEqual('string')
})

it('works in Firefox', () => {
  Error.captureStackTrace = undefined as any
  let error = new BrowserslistError('test')
  expect(error.stack).toBeUndefined()
})
