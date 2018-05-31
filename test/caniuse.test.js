var browserslist = require('../')

console.warn = jest.fn()

it('test caniuse version doesn\'t throw warning', () => {
  expect(browserslist.testCanIUse(1526515200000)).toBeUndefined()
})

browserslist.testCanIUse(1506015200000)

it('test caniuse version throw warning', () => {
  expect(console.warn).toHaveBeenCalled()
})
