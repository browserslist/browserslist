let browserslist = require('..')

let originUsage = browserslist.usage

beforeEach(() => {
  browserslist.usage = {
    rtcpeerconnection: {
      'and_chr 81': 'y',
      'firefox 2': 'n'
    }
  }
  browserslist.data.and_chr = {
    versions: ['81']
  }
})

afterEach(() => {
  browserslist.usage = originUsage
})

it('selects browsers by feature', () => {
  expect(browserslist('feature rtcpeerconnection')).toEqual(['and_chr 81'])
})
