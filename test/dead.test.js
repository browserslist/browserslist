var browserslist = require('../')

it('selects dead browsers by keywords', () => {
  expect(browserslist('dead').length).toBeGreaterThan(0)
})

it('selects dead browsers case insensitive', () => {
  expect(browserslist('Dead')).toEqual(browserslist('dead'))
})
