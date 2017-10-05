jest.doMock('fs', () => ({ }))
jest.doMock('path', () => ({ }))

var browserslist = require('../')

it('works without file system', () => {
  expect(browserslist(undefined, { path: './fixtures/rc/test.css' }))
    .toEqual(browserslist('defaults'))
})
