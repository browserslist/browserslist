var browserslist = require('../')
var fs = require('fs')

var originData = browserslist.data

function createDate (monthBack) {
  var releaseTime = Date.now() - monthBack * 30 * 24 * 60 * 60 * 1000
  return releaseTime / 1000
}

var youngerSixMonthsData = {
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

var olderSixMonthsData = {
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

function findPackage (text) {
  return /package.json/.test(text)
}

function findPackageAndYarn (text) {
  return /package.json/.test(text) || /yarn.lock/.test(text)
}

function mockStatSync () {
  return {
    isFile: () => true
  }
}

var originSxists = fs.existsSync
var originStat = fs.statSync

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
})

afterEach(() => {
  jest.clearAllMocks()
  fs.existsSync = originSxists
  fs.statSync = originStat
  browserslist.clearCaches()
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
    'Browserslist: caniuse-lite is outdated. ' +
    'Please run next command `npm update caniuse-lite browserslist`'
  )
})

it('shows warning only once', () => {
  browserslist.data = olderSixMonthsData
  fs.existsSync = findPackage
  fs.statSync = mockStatSync
  browserslist('last 2 versions')
  browserslist('last 2 versions')
  expect(console.warn).toHaveBeenCalledTimes(1)
})

it('detects yarn', () => {
  browserslist.data = olderSixMonthsData
  fs.existsSync = findPackageAndYarn
  fs.statSync = mockStatSync
  browserslist('last 2 versions')
  expect(console.warn).toHaveBeenCalledWith(
    'Browserslist: caniuse-lite is outdated. ' +
    'Please run next command `yarn upgrade caniuse-lite browserslist`'
  )
})
