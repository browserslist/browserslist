let browserslist = require('../')

it('selects dead browsers by keywords', () => {
  expect(browserslist('dead')).toContain('ie 10')
})

it('selects dead browsers case insensitive', () => {
  expect(browserslist('Dead')).toEqual(browserslist('dead'))
})
