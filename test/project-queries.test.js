var browserslist = require('../')

var path = require('path')

var PROJECT = path.join(__dirname, 'fixtures', 'project-queries')
var PROJECT_BL = path.join(PROJECT, 'bl')
var PROJECT_BL_TEST = path.join(PROJECT, 'bl', 'test')
var PROJECT_BL_TEST2 = path.join(PROJECT, 'bl', 'test2')
var PROJECT_BL_TEST3 = path.join(PROJECT, 'bl', 'test3')
var PROJECT_BL_TEST4 = path.join(PROJECT, 'bl', 'test4')

var originCwd = process.cwd()
afterEach(function () {
  process.chdir(originCwd)
})

it('project browserslist retrieves query from package.json via cwd', () => {
  process.chdir(PROJECT)
  // package.json -> "ie 10"
  var packageQueryResult = browserslist()

  process.chdir(PROJECT_BL)
  // bl/browserslist -> "ie 9"
  var blQueryResult = browserslist()

  process.chdir(PROJECT_BL_TEST)
  // bl/test/browserslist -> "ie 10" from package.json (project browserslist)
  var blTestQueryResult = browserslist()

  process.chdir(PROJECT_BL_TEST2)
  // bl/test2/<no config> -> "ie 9" from ../browserslist
  var blTest2QueryResult = browserslist()

  expect([
    packageQueryResult, blQueryResult, blTestQueryResult, blTest2QueryResult
  ]).toEqual([
    ['ie 10'], ['ie 9'], ['ie 10'], ['ie 9']])
})

it('project browserslist retrieves query from package.json via path', () => {
  // package.json -> "ie 10"
  var packageQueryResult = browserslist(undefined, { path: PROJECT })

  // bl/browserslist -> "ie 9"
  var blQueryResult = browserslist(undefined, { path: PROJECT_BL })

  // bl/test/browserslist -> "ie 10" from package.json (project browserslist)
  var blTestQueryResult = browserslist(undefined, { path: PROJECT_BL_TEST })

  // bl/test2/<no config> -> "ie 9" from ../browserslist
  var blTest2QueryResult = browserslist(undefined, { path: PROJECT_BL_TEST2 })

  expect([
    packageQueryResult, blQueryResult, blTestQueryResult, blTest2QueryResult
  ]).toEqual([
    ['ie 10'], ['ie 9'], ['ie 10'], ['ie 9']])
})

it('project electron version uses package.json devDependency version', () => {
  process.chdir(PROJECT)
  var result = browserslist('project electron version')
  expect(result.length).toBeGreaterThanOrEqual(1)
})

it('project browserslist recognizes self-refence', () => {
  expect(() => {
    browserslist('project browserslist', { path: PROJECT_BL_TEST4 })
  }).toThrowError(
    /Cannot use "project browserslist" query in package.json/)
})

it('project electron version throws if version is too complex', () => {
  expect(() => {
    browserslist('project electron version', { path: PROJECT_BL_TEST3 })
  }).toThrowError(
    /Electron version specification .* is too complex/)
})

it('project electron version throws if no electron dependency found', () => {
  expect(() => {
    browserslist('project electron version', { path: PROJECT_BL_TEST4 })
  }).toThrowError(
    /package\.json does not contain a devDependency on electron/)
})
