import { join } from 'path'

import browserslist from '../'

let FILE = join(__dirname, 'fixtures', 'env-config', 'test.css')

it('supports config query', () => {
  expect(
    browserslist('browserslist config, not chrome >0', {
      path: FILE, env: 'development'
    })
  ).toEqual(['firefox 50'])
})
