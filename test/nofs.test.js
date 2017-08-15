var browserslist = require('../')

jest.mock('fs')
jest.mock('path')

it('works without file system', () => {
  expect(browserslist(undefined, { path: './fixtures/rc/test.css' }))
    .toEqual(browserslist('defaults'))
})
