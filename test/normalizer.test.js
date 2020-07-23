let browserslist = require('../')

let originData = browserslist.data

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
})

afterEach(() => {
  browserslist.data = originData
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
