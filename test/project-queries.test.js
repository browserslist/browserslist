var browserslist = require('../')

var path = require('path')

var PROJECT = path.join(__dirname, 'fixtures', 'project-queries')
var PROJECT_BL = path.join(PROJECT, 'bl')
var PROJECT_BL_TEST = path.join(PROJECT, 'bl', 'test')
var PROJECT_BL_TEST2 = path.join(PROJECT, 'bl', 'test2')

var originCwd = process.cwd()
afterEach(function () {
  process.chdir(originCwd)
})

it('project browserslist retrieves query from package.json', () => {
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

it('project electron version uses package.json devDependency version', () => {
  process.chdir(PROJECT)
  var result = browserslist('project electron version')
  expect(result.length).toBeGreaterThanOrEqual(1)
})
