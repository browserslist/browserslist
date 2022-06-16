let { test } = require('uvu')
let { equal, throws, is, match } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

let arrayContaining = (set, subset) => subset.every(v => set.includes(v))

test('selects Node.js version', () => {
  equal(browserslist('node 7.5.0'), ['node 7.5.0'])
})

test('supports case insensitive Node.js name', () => {
  equal(browserslist('Node 7.5.0'), ['node 7.5.0'])
})

test('throws on unknown Node.js version', () => {
  throws(() => browserslist('node 3'), /Unknown version/)
})

test('throws on malformed Node.js version', () => {
  throws(() => browserslist('node 8.a'), /Unknown/)
  throws(() => browserslist('node 8.8.8.8'), /Unknown/)
  throws(() => browserslist('node 8.01'), /Unknown/)
  throws(() => browserslist('node 6 - 8.a'), /Unknown/)
})

test('return empty array on unknown Node.js version with special flag', () => {
  equal(browserslist('node 3', { ignoreUnknownVersions: true }), [])
})

test('supports selection of Node.js version by major.minor query', () => {
  equal(browserslist('node 5.1'), ['node 5.1.0'])
})

test('supports selection of Node.js version by major version only', () => {
  equal(browserslist('node 5'), ['node 5.12.0'])
})

test('selects maintained Node.js versions', () => {
  is(Array.isArray(browserslist('maintained node versions')), true)
})

test('supports case insensitive query for maintained Node.js versions', () => {
  is(Array.isArray(browserslist('maintained Node versions')), true)
})

test('supports current node version', () => {
  let versions = browserslist('current node')
  is(versions.length, 1)
  match(versions[0], /node \d+\.\d+\.\d+/)
})

test('supports comparison operator', () => {
  equal(browserslist('node <= 5'), [
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

  equal(browserslist('node < 5'), [
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

  is(browserslist('Node <= 5').length, 22)

  is(
    arrayContaining(browserslist('node >= 9'), [
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
    ]),
    true
  )

  is(
    arrayContaining(browserslist('node > 9'), [
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
    ]),
    true
  )
})

test('supports range selection', () => {
  equal(
    browserslist('node 4-6'),
    [
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
    ]
  )

  equal(
    browserslist('node 4-6.0.0'),
    [
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
    ]
  )

  equal(
    browserslist('node 6.5-7.5'),
    [
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
    ]
  )

  equal(
    browserslist('node 6.6.4-7.7.5'),
    [
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
    ]
  )
})

test('supports last versions for Node.js', () => {
  is(browserslist('last 2 node versions').length >= 1, true)

  browserslist.nodeVersions = ['16.0.0', '16.1.0', '17.0.0', '17.1.0']
  equal(browserslist('last 3 node versions'), [
    'node 17.1.0',
    'node 17.0.0',
    'node 16.1.0'
  ])
})

test('supports last major versions for Node.js', () => {
  is(browserslist('last 2 node major versions').length >= 1, true)

  browserslist.nodeVersions = [
    '14.0.0',
    '14.1.0',
    '15.0.0',
    '15.1.0',
    '16.0.0',
    '16.1.0',
    '17.0.0',
    '17.1.0'
  ]
  equal(browserslist('last 3 node major versions'), [
    'node 17.1.0',
    'node 17.0.0',
    'node 16.1.0',
    'node 16.0.0',
    'node 15.1.0',
    'node 15.0.0'
  ])
})

test.run()
