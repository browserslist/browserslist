jest.doMock('path', () => ({ }))
jest.doMock('../node.js', () => require('../browser'))

let browserslist = require('../')

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
  }).toThrow(/Sharable configs are not supported/)
})

it('throws on country statistics', () => {
  expect(() => {
    browserslist('> 1% in US')
  }).toThrow(/Country statistics are not supported/)
})

it('throws on feature statistics', () => {
  expect(() => {
    browserslist('supports rtcpeerconnection')
  }).toThrow(/Supports queries are not available/)
})

it('throws on semver range', () => {
  expect(() => {
    browserslist('node semver ^10.0.0')
  }).toThrow(/Semver queries are not available/)
})

it('throws on config path', () => {
  expect(() => {
    browserslist(undefined, { config: './config/.browserslistrc' })
  }).toThrow(/Browserslist config are not supported/)
})

it('has config methods', () => {
  expect(browserslist.clearCaches()).toBeUndefined()
  expect(browserslist.parseConfig('')).toBeUndefined()
  expect(browserslist.readConfig()).toBeUndefined()
  expect(browserslist.findConfig()).toBeUndefined()
})

it('supports current node version', () => {
  let versions = browserslist('current node')
  expect(versions).toHaveLength(1)
  expect(versions[0]).toMatch(/node \d+\.\d+\.\d+/)
})
