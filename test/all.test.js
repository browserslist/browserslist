var browserslist = require('../')

var originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11']
    },
    edge: {
      name: 'edge',
      released: ['12'],
      versions: ['12', '13']
    },
    chrome: {
      name: 'chrome',
      released: ['37', '38', '39'],
      versions: ['37', '38', '39', '40']
    },
    bb: {
      name: 'bb',
      released: ['8'],
      versions: ['8']
    },
    firefox: {
      released: []
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects all versions of each browser', () => {
  expect(browserslist('all')).toEqual([
    'bb 8',
    'chrome 40',
    'chrome 39',
    'chrome 38',
    'chrome 37',
    'edge 13',
    'edge 12',
    'ie 11',
    'ie 10',
    'ie 9'
  ])
})
