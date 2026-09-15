let { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } = require('fs')
let { tmpdir } = require('os')
let { join } = require('path')
let { test } = require('uvu')
let { equal, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('continues intersections between query-array entries', () => {
  equal(browserslist(['ie >= 6 and', 'ie <= 7']), ['ie 7', 'ie 6'])
  equal(browserslist(['ie >= 6 AND\t', '\tie <= 7']), ['ie 7', 'ie 6'])
})

test('continues explicit unions between query-array entries', () => {
  equal(browserslist(['ie 6 or', 'ie 7']), ['ie 7', 'ie 6'])
  equal(browserslist(['ie 6 OR\t', 'ie 7']), ['ie 7', 'ie 6'])
  equal(browserslist(['ie 6,', 'ie 7']), ['ie 7', 'ie 6'])
})

test('preserves left-to-right composition across continuations', () => {
  equal(browserslist(['ie 6 or', 'ie 7 and', 'ie <= 6']), ['ie 6'])
  equal(browserslist(['ie 6 and', 'ie 7', 'ie 8']), ['ie 8'])
  equal(browserslist(['ie >= 6 and', 'not ie > 7']), ['ie 7', 'ie 6'])
})

test('keeps unconnected entries as implicit unions', () => {
  equal(browserslist(['ie 6', 'ie 7']), ['ie 7', 'ie 6'])
  equal(browserslist(['ie 6', 'ie 7 and ie <= 6']), ['ie 6'])
  equal(browserslist(['', 'ie 6', '']), ['ie 6'])
})

test('rejects incomplete and malformed continuations', () => {
  for (let queries of [
    ['ie 6 and'],
    ['ie 6 or'],
    ['ie 6 and', ''],
    ['ie 6 and', 'or ie 7'],
    ['ie 6 and or', 'ie 7'],
    ['ie 6,'],
    [',', 'ie 7'],
    [' and ', 'ie 7']
  ]) {
    throws(() => browserslist(queries), /Unknown browser query/)
  }
})

test('retains continuation operators in the parsed AST', () => {
  equal(browserslist.parse(['ie 6 or', 'ie 7 and', 'ie <= 6']), [
    {
      query: 'ie 6',
      type: 'browser_version',
      browser: 'ie',
      version: '6',
      compose: 'or'
    },
    {
      query: 'ie 7',
      type: 'browser_version',
      browser: 'ie',
      version: '7',
      compose: 'or'
    },
    {
      query: 'ie <= 6',
      type: 'browser_ray',
      browser: 'ie',
      sign: '<=',
      version: '6',
      compose: 'and'
    }
  ])
})

test('loads continuations from config lines and package arrays', () => {
  for (let [name, content] of [
    [
      '.browserslistrc',
      '[production]\nie 11\n[test]\nie >= 6 and # intersection\n\n# comment\nie <= 7\n'
    ],
    [
      'package.json',
      JSON.stringify({ browserslist: { test: ['ie >= 6 and', 'ie <= 7'] } })
    ]
  ]) {
    let dir = mkdtempSync(join(tmpdir(), 'browserslist-'))
    try {
      writeFileSync(join(dir, name), content)
      equal(browserslist(null, { config: join(dir, name), env: 'test' }), [
        'ie 7',
        'ie 6'
      ])
    } finally {
      browserslist.clearCaches()
      unlinkSync(join(dir, name))
      rmdirSync(dir)
    }
  }
})

test('does not continue an operator into another config section', () => {
  let dir = mkdtempSync(join(tmpdir(), 'browserslist-'))
  try {
    writeFileSync(
      join(dir, '.browserslistrc'),
      '[test]\nie >= 6 and\n[production]\nie 7\n'
    )
    throws(
      () =>
        browserslist(null, { config: join(dir, '.browserslistrc'), env: 'test' }),
      /Unknown browser query/
    )
    equal(
      browserslist(null, {
        config: join(dir, '.browserslistrc'),
        env: 'production'
      }),
      ['ie 7']
    )
  } finally {
    browserslist.clearCaches()
    unlinkSync(join(dir, '.browserslistrc'))
    rmdirSync(dir)
  }
})

test.run()
