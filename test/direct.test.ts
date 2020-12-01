import browserslist from '../'

it('selects browser by name', () => {
  expect(browserslist('ie 10')).toEqual(['ie 10'])
})

it('uses case insensitive aliases', () => {
  let result = browserslist('ie 10')
  expect(browserslist('Explorer 10')).toEqual(result)
  expect(browserslist('IE 10')).toEqual(result)
})

it('raises on unknown name', () => {
  expect(() => {
    browserslist('unknow 10')
  }).toThrow('Unknown browser unknow')
})

it('raises on unknown version', () => {
  expect(() => {
    browserslist('IE 1')
  }).toThrow('Unknown version 1 of IE')
})

it('uses right browser name in error', () => {
  expect(() => {
    browserslist('chrome 70, ie 11, safari 12.2, safari 12')
  }).toThrow('Unknown version 12.2 of safari')
})

it('ignores unknown versions on request', () => {
  expect(browserslist('IE 1, IE 9', { ignoreUnknownVersions: true })).toEqual([
    'ie 9'
  ])
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
  let opts = { mobileToDesktop: true }
  expect(browserslist('chromeandroid 53', opts)).toEqual(['and_chr 53'])
  expect(browserslist('and_ff 60', opts)).toEqual(['and_ff 60'])
  expect(browserslist('ie_mob 9', opts)).toEqual(['ie_mob 9'])
  expect(browserslist('op_mob 30', opts)).toEqual(['op_mob 30'])
  expect(browserslist('chromeandroid >= 52 and chromeandroid < 54', opts))
    .toEqual(['and_chr 53', 'and_chr 52'])
  expect(browserslist('and_chr 52-53', opts))
    .toEqual(['and_chr 53', 'and_chr 52'])
  expect(browserslist('android 4.4-38', opts))
    .toEqual([
      'android 38',
      'android 37',
      'android 36',
      'android 4.4.3-4.4.4',
      'android 4.4'
    ])
})

it('missing mobile versions are not aliased by default', () => {
  expect(browserslist('chromeandroid 53')).not.toEqual(['and_chr 53'])
  expect(browserslist('and_ff 60')).not.toEqual(['and_ff 60'])
  expect(() => browserslist('ie_mob 9')).toThrow(/Unknown version 9 of ie_mob/)
  expect(() => browserslist('op_mob 30')).toThrow(/Unknown version 30/)
})

it('works for all browsers', () => {
  let first = browserslist(['> 0%', 'dead'])
  browserslist(first, { mobileToDesktop: true })
})
