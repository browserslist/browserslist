var browserslist = require('../')

it('query composition with AND operator', () => {
  // old behavior
  expect(
    browserslist('ie >= 6, ie <= 7')
  ).toEqual([
    'ie 11',
    'ie 10',
    'ie 9',
    'ie 8',
    'ie 7',
    'ie 6',
    'ie 5.5'
  ])

  // new behavior
  expect(
    browserslist('ie >= 6 and ie <= 7')
  ).toEqual([
    'ie 7',
    'ie 6'
  ])

  // and with not
  expect(
    browserslist('ie < 11 and not ie 7')
  ).toEqual([
    'ie 10',
    'ie 9',
    'ie 8',
    'ie 6',
    'ie 5.5'
  ])
})

it('correctly works with not and one-version browsers as AND query', () => {
  expect(browserslist('last 1 Baidu version and not <2% in AT')).toHaveLength(0)
})
