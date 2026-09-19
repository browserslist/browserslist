let { test } = require('uvu')
let { equal, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
let browserslist = require('..')

test('parses queries to AST', () => {
  equal(browserslist.parse('last 2 version and >1%, not ie 11'), [
    {
      query: 'last 2 version',
      type: 'last_versions',
      versions: '2',
      compose: 'or'
    },
    {
      query: '>1%',
      type: 'popularity',
      sign: '>',
      popularity: '1',
      compose: 'and'
    },
    {
      query: 'not ie 11',
      not: true,
      type: 'browser_version',
      browser: 'ie',
      version: '11',
      compose: 'or'
    }
  ])
})

test('parses case-insensitive negations', () => {
  for (let operator of ['Not', 'nOt', 'NOT']) {
    let query = `${operator} IE 11`
    equal(browserslist.parse(query), [
      {
        query,
        not: true,
        type: 'browser_version',
        browser: 'IE',
        version: '11',
        compose: 'or'
      }
    ])
    equal(browserslist(`ie >= 9, ${query}`), ['ie 10', 'ie 9'])
    equal(browserslist(`ie >= 9 and ${query}`), ['ie 10', 'ie 9'])
    equal(browserslist(['ie >= 9', query]), ['ie 10', 'ie 9'])
    throws(
      () => browserslist(`${operator} ie 11`),
      /^Write any browsers query/
    )
  }
})

test.run()
