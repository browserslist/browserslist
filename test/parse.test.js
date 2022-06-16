let { test } = require('uvu')
let { equal } = require('uvu/assert')

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

test.run()
