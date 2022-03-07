let { test } = require('uvu')
let { is, ok } = require('uvu/assert')

let browserslist = require('..')
let linter = require('../linter')

test('reports missed-not-dead problem', () => {
  let problems = linter.lint(browserslist, ['last 2 major versions', 'last 2 versions'])

  is(problems.filter(p => p.id === 'missed-not-dead').length, 1)
})

test('does not reports missed-not-dead problem', () => {
  let problems = linter.lint(browserslist, [
    'last 2 major versions',
    'last 2 versions',
    'not dead'
  ])

  is(problems.filter(p => p.id === 'missed-not-dead').length, 0)
})

test('reports limited-browsers problem', () => {
  let problems = linter.lint(browserslist, [
    'last 2 firefox versions',
    'last 2 firefox major versions',
    'unreleased firefox versions',
    'firefox 0-10',
    'firefox > 0',
    'firefox 11',
    'chrome 11',
    'chrome > 11'
  ])

  is(problems.filter(p => p.id === 'limited-browsers').length, 1)
})

test('does not reports limited-browsers problem', () => {
  let problems = linter.lint(browserslist, [
    'chrome > 0',
    'firefox > 0',
    'edge > 0',
    'ie > 0',
    'opera > 0',
    'safari > 0',
    'samsung > 0'
  ])

  is(problems.filter(p => p.id === 'limited-browsers').length, 0)
})

test('reports country-was-ignored problem', () => {
  let problems = linter.lint(browserslist, 'last 2 versions')

  is(problems.filter(p => p.id === 'country-was-ignored').length, 1)
})

test('does not reports country-was-ignored problem', () => {
  let problems = linter.lint(browserslist, 'last 100 versions')

  is(problems.filter(p => p.id === 'country-was-ignored').length, 0)
})

test('formats report', () => {
  let problems = linter.lint(browserslist, 'last 2 versions')
  let report = linter.formatReport(problems)

  ok(report.length > 0)
})

test.run()
