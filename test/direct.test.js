var browserslist = require('../')

it('selects browser by name', () => {
  expect(browserslist('ie 10')).toEqual(['ie 10'])
})

it('uses case insensitive aliases', () => {
  var result = browserslist('ie 10')
  expect(browserslist('Explorer 10')).toEqual(result)
  expect(browserslist('IE 10')).toEqual(result)
})

it('raises on unknown name', () => {
  expect(() => {
    browserslist('unknow 10')
  }).toThrowError('Unknown browser unknow')
})

it('raises on unknown version', () => {
  expect(() => {
    browserslist('IE 1')
  }).toThrowError('Unknown version 1 of IE')
})

it('uses right browser name in error', () => {
  expect(() => {
    browserslist('chrome 70, ie 11, safari 12.2, safari 12')
  }).toThrowError('Unknown version 12.2 of safari')
})

it('ignores unknown versions on request', () => {
  expect(browserslist('IE 1, IE 9', { ignoreUnknownVersions: true }))
    .toEqual(['ie 9'])
})

it('works with joined versions from Can I Use', () => {
  expect(browserslist('ios 7.0')).toEqual(['ios_saf 7.0-7.1'])
  expect(browserslist('ios 7.1')).toEqual(['ios_saf 7.0-7.1'])
})

it('allows to miss zero in version', () => {
  expect(browserslist('ios 7')).toEqual(['ios_saf 7.0-7.1'])
  expect(browserslist('ios 8.0')).toEqual(['ios_saf 8'])
})

it('supports Safari TP', () => {
  expect(browserslist('safari tp')).toEqual(['safari TP'])
  expect(browserslist('Safari TP')).toEqual(['safari TP'])
})

it('supports Can I Use cutted versions', () => {
  expect(browserslist('and_uc 10')).toHaveLength(1)
})

it('supports Can I Use missing mobile versions', () => {
  expect(browserslist('chromeandroid 53')).toEqual(['and_chr 53'])
})
