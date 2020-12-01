import browserslist from '../'

let originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11'],
      releaseDate: {},
    },
    edge: {
      name: 'edge',
      released: ['12'],
      versions: ['12', '13'],
      releaseDate: {},
    },
    chrome: {
      name: 'chrome',
      released: ['37', '38', '39'],
      versions: ['37', '38', '39', '40'],
      releaseDate: {},
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects unreleased versions of each browser', () => {
  expect(browserslist('unreleased versions')).toEqual(['chrome 40', 'edge 13'])
})

it('selects unreleased versions of specific browser', () => {
  expect(browserslist('unreleased Edge versions')).toEqual(['edge 13'])
})

it('is case insensitive', () => {
  expect(browserslist('Unreleased Versions')).toEqual(['chrome 40', 'edge 13'])
  expect(browserslist('Unreleased Chrome versions')).toEqual(['chrome 40'])
})
