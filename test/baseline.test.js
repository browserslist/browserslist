let { getCompatibleVersions } = require('baseline-browser-mapping')
let { test } = require('uvu')
let { is, equal, throws } = require('uvu/assert')

delete require.cache[require.resolve('..')]
const browserslist = require('..')

let nameMapping = {
  chrome: 'chrome',
  chrome_android: 'and_chr',
  edge: 'edge',
  firefox: 'firefox',
  firefox_android: 'and_ff',
  safari: 'safari',
  safari_ios: 'ios_saf',
  webview_android: 'android',
  samsunginternet_android: 'samsung',
  opera_android: 'op_mob',
  opera: 'opera',
  qq_android: 'and_qq',
  uc_android: 'and_uc',
  kai_os: 'kaios'
}

// Test Widely available
let browserslistBaselineWidely = browserslist('baseline widely available')
let bbmWidely = getCompatibleVersions().filter(
  version =>
    version.browser !== 'chrome_android' &&
    version.browser !== 'firefox_android'
)

test('Widely available versions from baseline-browser-mapping appear in browserslist output', () => {
  is(
    bbmWidely.reduce((acc, version) => {
      if (acc === false) return false
      return (
        browserslistBaselineWidely
          .filter(
            browser => browser.indexOf(nameMapping[version.browser]) !== -1
          )
          .find(
            browser =>
              browser.indexOf(` ${version.version}`) ||
              browser.indexOf(`-${version.version}`)
          ).length !== 0
      )
    }, true),
    true
  )
})

//Test Newly and Widely on date
let date30MonthsFromNow = new Date(
  new Date().setMonth(new Date().getMonth() + 30)
)
  .toISOString()
  .slice(0, 10)
let browserslistBaselineNewly = browserslist('baseline newly available')
let browserslistBaselineWidelyByDate = browserslist(
  `baseline widely available on ${date30MonthsFromNow}`
)

test('Newly available today and Widely available 30 months from now match', () => {
  equal(browserslistBaselineNewly, browserslistBaselineWidelyByDate)
})

// Test year and downstream inclusion
// Skips Android Chrome and Firefox for now because statcounter only ever includes latest version
let baseline2020MinVersions = [
  'chrome 87',
  'edge 87',
  'firefox 83',
  'safari 14',
  'ios_saf 14.0-14.4'
]

// Doesn't include the browsers with less stable statcounter data like QQ and UC
let baseline2020MinVersionsWithDownstream = [
  ...baseline2020MinVersions,
  'samsung 14.0',
  'opera 73',
  'kaios 3.0-3.1'
]

let browserslistBaseline2020 = browserslist(
  'baseline 2020 with downstream including kaios'
)

test('Selects proper core versions for baseline 2020', () => {
  is(
    baseline2020MinVersions.reduce((acc, curr) => {
      return acc === false
        ? false
        : browserslistBaseline2020.indexOf(curr) !== -1
    }, true),
    true
  )
})

test('Selects proper downstream versions for baseline 2020', () => {
  is(
    baseline2020MinVersionsWithDownstream.reduce((acc, curr) => {
      return acc === false
        ? false
        : browserslistBaseline2020.indexOf(curr) !== -1
    }, true),
    true
  )
})

// Test for errors
test('Throws an error when "newly available on YYYY-MM-DD" is used', () => {
  throws(() => {
    browserslist('baseline newly available on 2022-07-01')
  }, /Using newly available with a date is not supported/)
})

test.run()
