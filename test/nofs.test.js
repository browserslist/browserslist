var browserslist = require('../')

var path = require('path')

var FILE = path.join(__dirname, 'fixtures', 'rc', 'test.css')

jest.mock('fs')

it('works without file system', () => {
  expect(browserslist(undefined, { path: FILE }))
    .toEqual(browserslist('defaults'))
})
