let browserslist = require('../')

it('selects balanced browsers by keywords', () => {
  expect(browserslist('balanced')).toContain('firefox esr')
})

it('selects balanced browsers case insensitive', () => {
  expect(browserslist('Balanced')).toEqual(browserslist('balanced'))
})
