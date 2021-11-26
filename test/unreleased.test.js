let { test } = require('uvu')
let { equal } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let originData = { ...browserslist.data }

test.before.each(() => {
  browserslist.data = {
    ie: {
      name: 'ie',
      released: ['9', '10', '11'],
      versions: ['9', '10', '11'],
      releaseDate: {}
    },
    edge: {
      name: 'edge',
      released: ['12'],
      versions: ['12', '13'],
      releaseDate: {}
    },
    chrome: {
      name: 'chrome',
      released: ['37', '38', '39'],
      versions: ['37', '38', '39', '40'],
      releaseDate: {}
    }
  }
})

test.after.each(() => {
  browserslist.data = originData
})

test('selects unreleased versions of each browser', () => {
  equal(browserslist('unreleased versions'), ['chrome 40', 'edge 13'])
})

test('selects unreleased versions of specific browser', () => {
  equal(browserslist('unreleased Edge versions'), ['edge 13'])
})

test('is case insensitive', () => {
  equal(browserslist('Unreleased Versions'), ['chrome 40', 'edge 13'])
  equal(browserslist('Unreleased Chrome versions'), ['chrome 40'])
})

test.run()
