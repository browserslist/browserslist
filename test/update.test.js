var browserslist = require('../')
var updateNotifier = require('../update')
var getIntervalFromLatestRelease =
 jest.fn(updateNotifier.getIntervalFromLatestRelease)
var caniuseUpdateNotifier =
 jest.fn(updateNotifier.caniuseUpdateNotifier)

var interval = browserslist.data.intervalFromLatestRelease
var message = '\n[Browserslist]:\n' +
'https://github.com/ben-eb/caniuse-lite ' +
'hasn\'t been updated for more than ' +
 interval + ' days!\n' +
'To update, run:\n' +
'npm update caniuse-lite browserslist or' +
' yarn upgrade caniuse-lite browserslist\n'

var trueConsole = console.warn
var trueData = browserslist.data

var latestRelease = new Date().getTime() / 1000
var fakeData = {
  firefox: {
    name: '',
    versions: [],
    released: [],
    releaseDate: { 1: 1, 2: 2, 3: 3 }
  },
  chrome: {
    name: '',
    versions: [],
    released: [],
    releaseDate: { 1: 2, 2: 3, 3: 4 }
  },
  edge: {
    name: '',
    versions: [],
    released: [],
    releaseDate: { 1: 3, 2: 4, 3: latestRelease }
  }
}

describe('testing updateNotifier internals',
  () => {
    beforeAll(() => {
      browserslist.data = fakeData
    })
    afterAll(() => {
      browserslist.data = trueData
    })

    it('should calculate interval from latest release', () => {
      expect(getIntervalFromLatestRelease(browserslist.data)).toBe(0)
    })
    /* re-run prevention */
    it('should change updateNotifier.notified property to true' +
     'and return its value', () => {
      expect(caniuseUpdateNotifier(188)).toBe(true)
    })
    it('should return null if updateNotifier.notified is equal to true',
      () => {
        expect(getIntervalFromLatestRelease()).toBeNull()
      })
  })

describe('integration with browserslist', () => {
  beforeAll(() => {
    jest.resetAllMocks()
  })
  beforeEach(() => {
    console.warn = jest.fn()
  })
  afterEach(() => {
    console.warn = trueConsole
  })

  it('should append intervalFromLatestRelease property to browserslist.data',
    () => {
      browserslist('last 2 versions')
      expect(typeof browserslist.data.intervalFromLatestRelease).toBe('number')
    })
  it('should NOT call console if interval < 188', () => {
    browserslist.data.intervalFromLatestRelease = 18
    browserslist('last 2 versions')
    expect(console.warn).not.toHaveBeenCalled()
  })
  it('should call console if interval >= 188', () => {
    browserslist.data.intervalFromLatestRelease = 188
    var fakeInterval = 188
    message = message.replace(interval, fakeInterval)
    browserslist('last 2 versions')
    expect(console.warn).toHaveBeenCalledWith(message)
  })
  it('should NOT be executed if it was executed before', () => {
    browserslist('last 2 versions')
    expect(getIntervalFromLatestRelease).not.toHaveBeenCalled()
    expect(caniuseUpdateNotifier).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
  })
})

module.exports = {
  message: message
}
