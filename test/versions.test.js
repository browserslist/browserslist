let browserslist = require('../')

let originData = browserslist.data

beforeEach(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['8', '9', '10', '11'],
      versions: ['8', '9', '10', '11']
    },
    android: {
      name: 'android',
      released: ['4.2-4.3'],
      versions: ['4.2-4.3']
    },
    and_qq: {
      name: 'and_qq',
      released: ['1.2'],
      versions: ['1.2']
    }
  }
})

afterEach(() => {
  browserslist.data = originData
})

it('selects browser by more sign', () => {
  expect(browserslist('ie > 9')).toEqual(['ie 11', 'ie 10'])
})

it('selects browser by more or equal sign', () => {
  expect(browserslist('ie >= 10')).toEqual(['ie 11', 'ie 10'])
})

it('selects browser by less sign', () => {
  expect(browserslist('ie < 10')).toEqual(['ie 9', 'ie 8'])
})

it('selects browser by less or equal sign', () => {
  expect(browserslist('ie <= 9')).toEqual(['ie 9', 'ie 8'])
})

it('uses case insensitive aliases', () => {
  expect(browserslist('Explorer > 10')).toEqual(['ie 11'])
})

it('raises on unknown browser', () => {
  expect(() => {
    browserslist('unknow > 10')
  }).toThrow('Unknown browser unknow')
})

it('works with joined versions from Can I Use', () => {
  expect(browserslist('android >= 4.2')).toEqual(['android 4.2-4.3'])
  expect(browserslist('android >= 4.3')).toEqual(['android 4.2-4.3'])
})

it('allows omission of the space around the operator', () => {
  expect(browserslist('ie<=9')).toEqual(['ie 9', 'ie 8'])
})

it('selects browser with one version', () => {
  expect(browserslist('and_qq > 0')).toEqual(['and_qq 1.2'])
})
