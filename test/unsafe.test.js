let browserslist = require('../')

it('selects unsafe browsers by keywords', () => {
  expect(browserslist('unsafe')).toContain('ie 11')
})

it('selects unsafe browsers case insensitive', () => {
  expect(browserslist('Unsafe')).toEqual(browserslist('unsafe'))
})
