let browserslist = require('../')

it('selects Firefox ESR', () => {
  let versions = browserslist('Firefox ESR')
  expect(versions.length).toBeGreaterThanOrEqual(1)
  expect(versions.every(i => /^firefox \d+$/.test(i))).toBeTruthy()
})

it('uses case insensitive aliases', () => {
  let result = browserslist('Firefox ESR')
  expect(browserslist('firefox esr')).toEqual(result)
  expect(browserslist('ff esr')).toEqual(result)
  expect(browserslist('fx esr')).toEqual(result)
})
