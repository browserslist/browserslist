let browserslist = require('../')

it('selects safe browsers by keywords', () => {
  expect(browserslist('safe')).toContain('firefox 68')
})

it('selects safe browsers case insensitive', () => {
  expect(browserslist('Safe')).toEqual(browserslist('safe'))
})
