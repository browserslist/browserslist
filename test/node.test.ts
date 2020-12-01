import browserslist from '../'

it('selects Node.js version', () => {
  expect(browserslist('node 7.5.0')).toEqual(['node 7.5.0'])
})

it('supports case insensitive Node.js name', () => {
  expect(browserslist('Node 7.5.0')).toEqual(['node 7.5.0'])
})

it('throws on unknown Node.js version', () => {
  expect(() => {
    browserslist('node 3')
  }).toThrow(/Unknown version/)
})

it('throws on malformed Node.js version', () => {
  expect(() => {
    browserslist('node 8.a')
  }).toThrow(/Unknown/)
  expect(() => {
    browserslist('node 8.8.8.8')
  }).toThrow(/Unknown/)
  expect(() => {
    browserslist('node 8.01')
  }).toThrow(/Unknown/)
  expect(() => {
    browserslist('node 6 - 8.a')
  }).toThrow(/Unknown/)
  expect(() => {
    browserslist('node 6.6.6.6 - 8')
  }).toThrow(/Unknown/)
  expect(() => {
    browserslist('node 6 - 8.01')
  }).toThrow(/Unknown/)
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
  let versions = browserslist('current node')
  expect(versions).toHaveLength(1)
  expect(versions[0]).toMatch(/node \d+\.\d+\.\d+/)
})

it('supports comparison operator', () => {
  expect(browserslist('node <= 5')).toEqual([
    'node 5.0.0',

    'node 4.9.0',
    'node 4.8.0',
    'node 4.7.0',
    'node 4.6.0',
    'node 4.5.0',
    'node 4.4.0',
    'node 4.3.0',
    'node 4.2.0',
    'node 4.1.0',
    'node 4.0.0',

    'node 0.12.0',
    'node 0.11.0',
    'node 0.10.0',
    'node 0.9.0',
    'node 0.8.0',
    'node 0.7.0',
    'node 0.6.0',
    'node 0.5.0',
    'node 0.4.0',
    'node 0.3.0',
    'node 0.2.0'
  ])

  expect(browserslist('node < 5')).toEqual([
    'node 4.9.0',
    'node 4.8.0',
    'node 4.7.0',
    'node 4.6.0',
    'node 4.5.0',
    'node 4.4.0',
    'node 4.3.0',
    'node 4.2.0',
    'node 4.1.0',
    'node 4.0.0',

    'node 0.12.0',
    'node 0.11.0',
    'node 0.10.0',
    'node 0.9.0',
    'node 0.8.0',
    'node 0.7.0',
    'node 0.6.0',
    'node 0.5.0',
    'node 0.4.0',
    'node 0.3.0',
    'node 0.2.0'
  ])

  expect(browserslist('Node <= 5')).toHaveLength(22)

  expect(browserslist('node >= 9')).toEqual(expect.arrayContaining([
    'node 9.0.0',
    'node 9.1.0',
    'node 9.2.0',
    'node 9.3.0',
    'node 9.4.0',
    'node 9.5.0',
    'node 9.6.0',
    'node 9.7.0',
    'node 9.8.0',
    'node 9.9.0',
    'node 9.10.0',
    'node 9.11.0',

    'node 10.0.0',
    'node 10.1.0',
    'node 10.2.0',
    'node 10.3.0',
    'node 10.4.0',
    'node 10.5.0',
    'node 10.6.0',
    'node 10.7.0',
    'node 10.8.0',
    'node 10.9.0',
    'node 10.10.0',
    'node 10.11.0',
    'node 10.12.0',
    'node 10.13.0',
    'node 10.14.0',
    'node 10.15.0',

    'node 11.0.0',
    'node 11.1.0',
    'node 11.2.0',
    'node 11.3.0',
    'node 11.4.0',
    'node 11.5.0',
    'node 11.6.0',
    'node 11.7.0',
    'node 11.8.0',
    'node 11.9.0',
    'node 11.10.0'
  ]))

  expect(browserslist('node > 9')).toEqual(expect.arrayContaining([
    'node 9.1.0',
    'node 9.2.0',
    'node 9.3.0',
    'node 9.4.0',
    'node 9.5.0',
    'node 9.6.0',
    'node 9.7.0',
    'node 9.8.0',
    'node 9.9.0',
    'node 9.10.0',
    'node 9.11.0',

    'node 10.0.0',
    'node 10.1.0',
    'node 10.2.0',
    'node 10.3.0',
    'node 10.4.0',
    'node 10.5.0',
    'node 10.6.0',
    'node 10.7.0',
    'node 10.8.0',
    'node 10.9.0',
    'node 10.10.0',
    'node 10.11.0',
    'node 10.12.0',
    'node 10.13.0',
    'node 10.14.0',
    'node 10.15.0',

    'node 11.0.0',
    'node 11.1.0',
    'node 11.2.0',
    'node 11.3.0',
    'node 11.4.0',
    'node 11.5.0',
    'node 11.6.0',
    'node 11.7.0',
    'node 11.8.0',
    'node 11.9.0',
    'node 11.10.0'
  ]))
})

it('supports range selection', () => {
  expect(browserslist('node 4-6')).toEqual([
    'node 6.17.0',
    'node 6.16.0',
    'node 6.15.0',
    'node 6.14.0',
    'node 6.13.0',
    'node 6.12.0',
    'node 6.11.0',
    'node 6.10.0',
    'node 6.9.0',
    'node 6.8.0',
    'node 6.7.0',
    'node 6.6.0',
    'node 6.5.0',
    'node 6.4.0',
    'node 6.3.0',
    'node 6.2.0',
    'node 6.1.0',
    'node 6.0.0',

    'node 5.12.0',
    'node 5.11.0',
    'node 5.10.0',
    'node 5.9.0',
    'node 5.8.0',
    'node 5.7.0',
    'node 5.6.0',
    'node 5.5.0',
    'node 5.4.0',
    'node 5.3.0',
    'node 5.2.0',
    'node 5.1.0',
    'node 5.0.0',

    'node 4.9.0',
    'node 4.8.0',
    'node 4.7.0',
    'node 4.6.0',
    'node 4.5.0',
    'node 4.4.0',
    'node 4.3.0',
    'node 4.2.0',
    'node 4.1.0',
    'node 4.0.0'
  ])

  expect(browserslist('node 4-6.0.0')).toEqual([
    'node 6.0.0',

    'node 5.12.0',
    'node 5.11.0',
    'node 5.10.0',
    'node 5.9.0',
    'node 5.8.0',
    'node 5.7.0',
    'node 5.6.0',
    'node 5.5.0',
    'node 5.4.0',
    'node 5.3.0',
    'node 5.2.0',
    'node 5.1.0',
    'node 5.0.0',

    'node 4.9.0',
    'node 4.8.0',
    'node 4.7.0',
    'node 4.6.0',
    'node 4.5.0',
    'node 4.4.0',
    'node 4.3.0',
    'node 4.2.0',
    'node 4.1.0',
    'node 4.0.0'
  ])

  expect(browserslist('node 6.5-7.5')).toEqual([
    'node 7.5.0',
    'node 7.4.0',
    'node 7.3.0',
    'node 7.2.0',
    'node 7.1.0',
    'node 7.0.0',

    'node 6.17.0',
    'node 6.16.0',
    'node 6.15.0',
    'node 6.14.0',
    'node 6.13.0',
    'node 6.12.0',
    'node 6.11.0',
    'node 6.10.0',
    'node 6.9.0',
    'node 6.8.0',
    'node 6.7.0',
    'node 6.6.0',
    'node 6.5.0'
  ])

  expect(browserslist('node 6.6.4-7.7.5')).toEqual([
    'node 7.7.0',
    'node 7.6.0',
    'node 7.5.0',
    'node 7.4.0',
    'node 7.3.0',
    'node 7.2.0',
    'node 7.1.0',
    'node 7.0.0',

    'node 6.17.0',
    'node 6.16.0',
    'node 6.15.0',
    'node 6.14.0',
    'node 6.13.0',
    'node 6.12.0',
    'node 6.11.0',
    'node 6.10.0',
    'node 6.9.0',
    'node 6.8.0',
    'node 6.7.0',
    // include 6.6.0 as patch versions are ignored
    'node 6.6.0'
  ])
})
