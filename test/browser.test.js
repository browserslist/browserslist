let browserslist = require('../')

let originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11']
    },
    android: {
      name: 'android',
      released: ['4.4', '4.4.3-4.4.4', '67']
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects versions of browser', () => {
  expect(browserslist('last 2 ie versions')).toEqual(['ie 11', 'ie 10'])
})

it('does not include unreleased versions', () => {
  browserslist.data = originData
  expect(browserslist('last 2 safari versions')).not.toContain('safari TP')
})

it('supports pluralization', () => {
  expect(browserslist('last 1 ie version')).toEqual(['ie 11'])
})

it('has case insensitive aliases', () => {
  expect(browserslist('Last 01 Explorer Version')).toEqual(['ie 11'])
})

it('has special logic for android', () => {
  expect(browserslist('last 4 android versions')).toEqual([
    'android 67'
  ])
  expect(browserslist('last 31 android versions')).toEqual([
    'android 67', 'android 4.4.3-4.4.4'
  ])
})
