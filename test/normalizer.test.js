let browserslist = require('../')

let originData = browserslist.data
let originNormalizedVersions = browserslist.normalizedVersions

beforeEach(() => {
  browserslist.data = {
    samsung: {
      name: 'samsung',
      released: ['4'],
      versions: ['4']
    },
    kaios: {
      name: 'kaios',
      released: ['2.5'],
      versions: ['2.5']
    },
    android: {
      name: 'android',
      released: ['4.4', '4.4.3-4.4.4', '37'],
      versions: ['4.4', '4.4.3-4.4.4', '37']
    },
    and_chr: {
      name: 'and_chr',
      released: ['83'],
      versions: ['83']
    }
  }

  browserslist.normalizedVersions = {
    'samsung 4': 44,
    'kaios 2': 'and_ff 48'
  }
})

afterEach(() => {
  browserslist.data = originData
  browserslist.normalizedVersions = originNormalizedVersions
})

it('normalizes mobile browsers to desktop browsers', () => {
  let opts = { normalizers: ['toDesktop'] }
  expect(browserslist('android 37', opts)).toEqual(['chrome 37'])
  expect(browserslist('last 1 and_chr versions', opts)).toEqual(['chrome 83'])
  expect(browserslist('samsung 4', opts)).toEqual(['samsung 4'])
})

it('does not normalize classic Android webview versions', () => {
  let opts = { normalizers: ['toDesktop'] }
  expect(browserslist('android 4.4-37', opts)).toEqual([
    'android 4.4.3-4.4.4', 'android 4.4', 'chrome 37'
  ])
})

it('normalizes Chromium-based browsers to Chrome', () => {
  let opts = { normalizers: ['byEngine'] }
  expect(browserslist('samsung 4', opts)).toEqual(['and_chr 44'])
  expect(browserslist('kaios 2.5', opts)).toEqual(['and_ff 48'])
  expect(browserslist('and_chr 83', opts)).toEqual(['and_chr 83'])
})

it('should apply each normalizer in order', () => {
  let opts = { normalizers: ['byEngine', 'toDesktop'] }
  expect(browserslist('samsung 4', opts)).toEqual(['chrome 44'])
  expect(browserslist('kaios 2.5', opts)).toEqual(['firefox 48'])
  expect(browserslist('and_chr 83', opts)).toEqual(['chrome 83'])
})

it('accepts a normalizer function', () => {
  let opts = { normalizers: [() => 'samsung 4'] }
  expect(browserslist('android 37', opts)).toEqual(['samsung 4'])
})

it('raises on unknown normalizer', () => {
  let opts1 = { normalizers: ['_'] }
  let opts2 = { normalizers: [{}] }
  expect(() => {
    browserslist('samsung 4', opts1)
  }).toThrow('Unknown normalizer _')
  expect(() => {
    browserslist('samsung 4', opts2)
  }).toThrow('Unknown normalizer [object Object]')
})
