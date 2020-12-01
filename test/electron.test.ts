import browserslist from '../'

it('converts Electron to Chrome', () => {
  expect(browserslist('electron 1.1')).toEqual(['chrome 50'])
})

it('supports Electron Patch versions to Chrome', () => {
  expect(browserslist('electron 4.0.4')).toEqual(['chrome 69'])
})

it('supports case insensitive Electron name', () => {
  expect(browserslist('Electron 1.1')).toEqual(['chrome 50'])
})

it('throws on unknown Electron version', () => {
  expect(() => {
    browserslist('electron 0.19')
  }).toThrow(/Unknown version/)
})

it('converts Electron to Chrome in ranges', () => {
  expect(browserslist('electron 0.36-1.2')).toEqual([
    'chrome 51', 'chrome 50', 'chrome 49', 'chrome 47'
  ])
})

it('ignores case in Electron ranges', () => {
  expect(browserslist('Electron 0.37-1.0')).toEqual(['chrome 49'])
})

it('supports patch versions in Electron ranges', () => {
  expect(browserslist('Electron 0.37.5-1.0.3')).toEqual(['chrome 49'])
})

it('throws on unknown Electron range version', () => {
  expect(() => {
    browserslist('electron 0.1-1.2')
  }).toThrow(/Unknown version/)
  expect(() => {
    browserslist('electron 0.37-999')
  }).toThrow(/Unknown version/)
})

it('converts Electron versions to Chrome', () => {
  expect(browserslist('electron <= 0.21')).toEqual([
    'chrome 41', 'chrome 39'
  ])
})

it('ignores case in Electron versions', () => {
  expect(browserslist('Electron < 0.21')).toEqual(['chrome 39'])
})

it('converts Electron patch versions to Chrome', () => {
  expect(browserslist('Electron < 0.21.5')).toEqual(['chrome 39'])
})

it('supports last versions for Electron', () => {
  expect(browserslist('last 2 Electron versions').length)
    .toBeGreaterThanOrEqual(1)
})

it('supports last major versions for Electron', () => {
  expect(browserslist('last 2 Electron major versions').length)
    .toBeGreaterThanOrEqual(1)
})

it('supports unreleased versions for Electron', () => {
  expect(browserslist('unreleased Electron versions')).toHaveLength(0)
})
