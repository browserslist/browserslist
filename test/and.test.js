var browserslist = require('../')

var originUsage = browserslist.usage

var usageFixture = {
  global: {
    'ie 5.5': 0.009298,
    'ie 6': 0.00895953,
    'ie 7': 0.0134393,
    'ie 8': 0.179191,
    'ie 9': 0.161271,
    'ie 10': 0.107514,
    'ie 11': 2.71026
  }
}

beforeEach(() => {
  browserslist.usage = usageFixture
})
afterEach(() => {
  browserslist.usage = originUsage
})

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
