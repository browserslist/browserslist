let { join } = require('path')

let browserslist = require('..')

let FILE = join(__dirname, 'fixtures', 'env-config', 'test.css')

it('supports config query', () => {
  expect(
    browserslist('browserslist config, not chrome >0', {
      path: FILE,
      env: 'development'
    })
  ).toEqual(['firefox 50'])
})
