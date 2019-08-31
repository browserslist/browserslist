let browserslist = require('../')

it('converts PhantomJS to Safari', () => {
  expect(browserslist('phantomjs 2.1')).toEqual(['safari 6'])
  expect(browserslist('phantomjs 1.9')).toEqual(['safari 5'])
})

it('supports case insensitive PhantomJS name', () => {
  expect(browserslist('PhantomJS 2.1')).toEqual(['safari 6'])
  expect(browserslist('PhantomJS 1.9')).toEqual(['safari 5'])
})
