var browserslist = require('../')

var originData = browserslist.data
var originWarn = console.warn
var today = new Date()
function createDate (monthBack) {
  var releaseTime = new Date(
    today.getFullYear(),
    today.getMonth() - monthBack,
    today.getDate()
  ).getTime()
  return releaseTime / 1000
}

describe('there are release versions are younger than six months', () => {
  beforeEach(() => {
    browserslist.data = {
      ie: {
        name: 'ie',
        released: ['9', '10', '11'],
        versions: ['9', '10', '11'],
        releaseDate: {
          '9': createDate(14),
          '10': createDate(8),
          '11': createDate(7)
        }
      },
      edge: {
        name: 'edge',
        released: ['14', '15', '16', '17', '18'],
        versions: ['14', '15', '16', '17', '18'],
        releaseDate: {
          '14': createDate(8),
          '15': createDate(6),
          '16': createDate(5),
          '17': createDate(4),
          '18': null
        }
      },
      bb: {
        name: 'bb',
        released: [],
        versions: [],
        releaseDate: {}
      }
    }
    console.warn = jest.fn()
  })

  afterEach(() => {
    browserslist.data = originData
    console.warn = originWarn
  })

  it('checkCanIUse doesn\'t throw warning', () => {
    browserslist('last 2 versions')
    expect(console.warn).toHaveBeenCalledTimes(0)
  })
})

describe('all release versions are older than six months', () => {
  beforeEach(() => {
    browserslist.data = {
      ie: {
        name: 'ie',
        released: ['9', '10', '11'],
        versions: ['9', '10', '11'],
        releaseDate: {
          '9': createDate(7),
          '10': createDate(8),
          '11': createDate(10)
        }
      },
      edge: {
        name: 'edge',
        released: ['14', '15', '16', '17', '18'],
        versions: ['14', '15', '16', '17', '18'],
        releaseDate: {
          '14': createDate(9),
          '15': createDate(8),
          '16': createDate(12),
          '17': createDate(7),
          '18': null
        }
      },
      bb: {
        name: 'bb',
        released: [],
        versions: [],
        releaseDate: {}
      }
    }
    console.warn = jest.fn()
  })

  afterEach(() => {
    browserslist.data = originData
    console.warn = originWarn
  })

  it('checkCanIUse doesn\'t throw warning', () => {
    browserslist('last 2 versions')
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
