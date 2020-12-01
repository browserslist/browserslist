import browserslist from '../'

let originData = browserslist.data
let originWarn = console.warn

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      versions: ['1', '2', '3'],
      released: [],
      releaseDate: {
        1: 0, // Thu, 01 Jan 1970 00:00:00 +0000
        2: 1483228800, // Sun, 01 Jan 2017 00:00:00 +0000
        3: 1485907200 // Wed, 01 Feb 2017 00:00:00 +0000
      }
    }
  }
  console.warn = function (...args: any) {
    if (args[0].includes('--update-db')) return
    originWarn.apply(this, args)
  }
})

afterEach(() => {
  browserslist.data = originData
  console.warn = originWarn
})

it('selects versions released on year boundaries', () => {
  expect(browserslist('since 1970')).toEqual(['ie 3', 'ie 2', 'ie 1'])
})

it('is case insensitive', () => {
  expect(browserslist('Since 1970')).toEqual(['ie 3', 'ie 2', 'ie 1'])
})

it('selects versions released on year and month boundaries', () => {
  expect(browserslist('since 2017-01')).toEqual(['ie 3', 'ie 2'])
})

it('selects versions released on date boundaries', () => {
  expect(browserslist('since 2017-02-01')).toEqual(['ie 3'])
})
