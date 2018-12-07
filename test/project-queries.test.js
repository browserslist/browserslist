var browserslist = require('../')

var path = require('path')

var PROJECT = path.join(__dirname, 'fixtures', 'project-queries')
var PROJECT_BL_TEST1 = path.join(PROJECT, 'bl', 'test1')
var PROJECT_BL_TEST2 = path.join(PROJECT, 'bl', 'test2')

var originCwd = process.cwd()
afterEach(function () {
  process.chdir(originCwd)
})

it('project electron version uses package.json devDependency version', () => {
  process.chdir(PROJECT)
  var result = browserslist('project electron version')
  expect(result.length).toBeGreaterThanOrEqual(1)
})

it('project electron version throws if version is too complex', () => {
  expect(() => {
    browserslist('project electron version', { path: PROJECT_BL_TEST1 })
  }).toThrowError(
    /Electron version specification .* is too complex/)
})

it('project electron version throws if no electron dependency found', () => {
  expect(() => {
    browserslist('project electron version', { path: PROJECT_BL_TEST2 })
  }).toThrowError(
    /package\.json does not contain a devDependency on electron/)
})
