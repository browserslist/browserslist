import browserslist from '../'

it('selects defaults by keywords', () => {
  expect(browserslist('defaults, ie 6')).toEqual(
    browserslist(browserslist.defaults.concat(['ie 6']))
  )
})

it('selects defaults case insensitive', () => {
  expect(browserslist('Defaults')).toEqual(browserslist(browserslist.defaults))
})

it('should respect options', () => {
  expect(browserslist('defaults', { mobileToDesktop: true }))
    .toEqual(browserslist(browserslist.defaults, { mobileToDesktop: true }))
})
