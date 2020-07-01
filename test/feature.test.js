let browserslist = require('..')

let originUsage = browserslist.usage

beforeEach(() => {
  browserslist.usage = {}
  browserslist.data.and_chr = {
    versions: ['81']
  }
})

afterEach(() => {
  browserslist.usage = originUsage
})

it('load features from Can I Use', () => {
  expect(browserslist('supports objectrtc').length > 0).toBe(true)
})

it('selects browsers by feature', () => {
  browserslist.usage = {
    rtcpeerconnection: {
      'and_chr 81': 'y',
      'firefox 2': 'n'
    }
  }

  expect(browserslist('supports rtcpeerconnection')).toEqual(['and_chr 81'])
})
