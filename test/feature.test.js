let browserslist = require('..')

let originCache = browserslist.cache

beforeEach(() => {
  browserslist.cache = {}
  browserslist.data.and_chr = {
    name: 'and_chr',
    versions: ['81'],
    released: [],
    releaseDate: {}
  }
})

afterEach(() => {
  browserslist.cache = originCache
})

it('load features from Can I Use', () => {
  expect(browserslist('supports objectrtc').length > 0).toBe(true)
})

it('selects browsers by feature', () => {
  browserslist.cache = {
    rtcpeerconnection: {
      'and_chr 81': 'y',
      'firefox 2': 'n'
    }
  }

  expect(browserslist('supports rtcpeerconnection')).toEqual(['and_chr 81'])
})

it('selects browsers by feature with dashes in its name', () => {
  browserslist.cache = {
    'arrow-functions': {
      'and_chr 81': 'y',
      'ie 11': 'n'
    }
  }

  expect(browserslist('supports arrow-functions')).toEqual(['and_chr 81'])
})
