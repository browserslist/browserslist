var browserslist = require('../')

it('selects Node.js version', () => {
  expect(browserslist('node 7.5.0')).toEqual(['node 7.5.0'])
})

it('supports case insensitive Node.js name', () => {
  expect(browserslist('Node 7.5.0')).toEqual(['node 7.5.0'])
})

it('throws on unknown Node.js version', () => {
  expect(() => {
    browserslist('node 3')
  }).toThrowError(/Unknown version/)
})

it('return empty array on unknown Node.js version with special flag', () => {
  expect(browserslist('node 3', { ignoreUnknownVersions: true })).toEqual([])
})

it('supports selection of Node.js version by major.minor query', () => {
  expect(browserslist('node 5.1')).toEqual(['node 5.1.0'])
})

it('supports selection of Node.js version by major version only', () => {
  expect(browserslist('node 5')).toEqual(['node 5.12.0'])
})

it('selects maintained Node.js versions', () => {
  expect(Array.isArray(browserslist('maintained node versions'))).toBe(true)
})

it('supports case insensitive query for maintained Node.js versions', () => {
  expect(Array.isArray(browserslist('maintained Node versions'))).toBe(true)
})

it('supports current node version', () => {
  var versions = browserslist('current node')
  expect(versions).toHaveLength(1)
  expect(versions[0]).toMatch(/node \d+\.\d+\.\d+/)
})
