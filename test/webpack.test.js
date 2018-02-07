jest.doMock('path', () => ({ }))
jest.doMock('../node.js', () => require('../browser'))

var browserslist = require('../')

it('works without path', () => {
  expect(browserslist(undefined)).toEqual(browserslist('defaults'))
})

it('works with input file without path', () => {
  expect(browserslist(undefined, { path: './fixtures/rc/test.css' }))
    .toEqual(browserslist('defaults'))
})

it('throws on sharable config', () => {
  expect(() => {
    browserslist('extends browserslist-config-test')
  }).toThrowError(/Sharable configs are not supported/)
})

it('throws on country statistics', () => {
  expect(() => {
    browserslist('> 1% in US')
  }).toThrowError(/Country statistics is not supported/)
})

it('throws on config path', () => {
  expect(() => {
    browserslist(undefined, { config: './config/.browserslistrc' })
  }).toThrowError(/Browserslist config are not supported/)
})

it('has config methods', () => {
  expect(browserslist.clearCaches()).toBeUndefined()
  expect(browserslist.parseConfig('')).toBeUndefined()
  expect(browserslist.readConfig()).toBeUndefined()
  expect(browserslist.findConfig()).toBeUndefined()
})
