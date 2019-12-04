let browserslist = require('../')

let originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['8', '9', '10', '11'],
      versions: ['8', '9', '10', '11']
    },
    android: {
      name: 'android',
      released: ['4.2-4.3', '4.4',
        '4.4.3-4.4.4', '37'],
      versions: ['4.2-4.3', '4.4', '4.4.3-4.4.4', '37']
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects a range of browsers', () => {
  expect(browserslist('ie 8-10')).toEqual(['ie 10', 'ie 9', 'ie 8'])
})

it('selects versions with query out of range', () => {
  expect(browserslist('ie 1-12')).toEqual(['ie 11', 'ie 10', 'ie 9', 'ie 8'])
})

it('selects a range of android browsers', () => {
  expect(browserslist('android 4.3-37'))
    .toEqual([
      'android 37', 'android 4.4.3-4.4.4', 'android 4.4', 'android 4.2-4.3'
    ])
})

it('raises on an unknown browser', () => {
  expect(() => {
    browserslist('unknown 4-7')
  }).toThrow('Unknown browser unknown')
})
