let { join } = require('path')
let { test } = require('uvu')
let {  equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let FILE = join(__dirname, 'fixtures', 'env-config', 'test.css')

test('supports config query', () => {
  equal(
    browserslist('browserslist config, not chrome >0', {
      path: FILE,
      env: 'development'
    }),
    ['firefox 50']
  )
})

test.run()
