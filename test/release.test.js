let fs = require('fs')

let browserslist = require('../')

let originData = browserslist.data

function createDate (monthBack) {
  let releaseTime = Date.now() - monthBack * 30 * 24 * 60 * 60 * 1000
  return releaseTime / 1000
}

let youngerSixMonthsData = {
  ie: {
    name: 'ie',
    released: ['9', '10', '11'],
    versions: ['9', '10', '11'],
    releaseDate: {
      9: createDate(14),
      10: createDate(8),
      11: createDate(7)
    }
  },
  edge: {
    name: 'edge',
    released: ['14', '15', '16', '17', '18'],
    versions: ['14', '15', '16', '17', '18'],
    releaseDate: {
      14: createDate(8),
      15: createDate(6),
      16: createDate(5),
      17: createDate(4),
      18: null
    }
  },
  bb: {
    name: 'bb',
    released: [],
    versions: [],
    releaseDate: {}
  }
}

let olderSixMonthsData = {
  ie: {
    name: 'ie',
    released: ['9', '10', '11'],
    versions: ['9', '10', '11'],
    releaseDate: {
      9: createDate(7),
      10: createDate(8),
      11: createDate(10)
    }
  },
  edge: {
    name: 'edge',
    released: ['14', '15', '16', '17', '18'],
    versions: ['14', '15', '16', '17', '18'],
    releaseDate: {
      14: createDate(9),
      15: createDate(8),
      16: createDate(12),
      17: createDate(7),
      18: null
    }
  },
  bb: {
    name: 'bb',
    released: [],
    versions: [],
    releaseDate: {}
  }
}

function findPackage (text) {
  return /package.json/.test(text)
}

function mockStatSync () {
  return {
    isFile: () => true
  }
}

let originSxists = fs.existsSync
let originStat = fs.statSync

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
})

afterEach(() => {
  jest.clearAllMocks()
  fs.existsSync = originSxists
  fs.statSync = originStat
  browserslist.clearCaches()
  delete process.env.BROWSERSLIST_IGNORE_OLD_DATA
})

afterAll(() => {
  browserslist.data = originData
})

it('does not print warning', () => {
  browserslist.data = youngerSixMonthsData
  browserslist('last 2 versions')
  expect(console.warn).toHaveBeenCalledTimes(0)
})

it('shows warning', () => {
  browserslist.data = olderSixMonthsData
  fs.existsSync = findPackage
  fs.statSync = mockStatSync
  browserslist('last 2 versions')
  expect(console.warn).toHaveBeenCalledWith(
    'Browserslist: caniuse-lite is outdated. Please run:\n' +
    'npx browserslist@latest --update-db\n\n' +
    'See for details:\n' +
    'https://github.com/browserslist/browserslist#what-is---update-db-for'
  )
})

it('hides warning on request', () => {
  process.env.BROWSERSLIST_IGNORE_OLD_DATA = true
  browserslist.data = olderSixMonthsData
  fs.existsSync = findPackage
  fs.statSync = mockStatSync
  browserslist('last 2 versions')
  expect(console.warn).toHaveBeenCalledTimes(0)
})

it('shows warning only once', () => {
  browserslist.data = olderSixMonthsData
  fs.existsSync = findPackage
  fs.statSync = mockStatSync
  browserslist('last 2 versions')
  browserslist('last 2 versions')
  expect(console.warn).toHaveBeenCalledTimes(1)
})
