var updateNotifier = {
  notified: false,
  getIntervalFromLatestRelease: function (browserslistData) {
    if (!this.notified) {
      var releaseDates = []
      var agents = browserslistData
      Object.keys(agents).forEach(function (agent) {
        var releaseDateProp = agents[agent].releaseDate
        releaseDates.push(Object.keys(releaseDateProp)
          .map(function (key) { return releaseDateProp[key] }))
      })
      var latestRelease =
         Math.max.apply(null, [].concat.apply([], releaseDates))
      var day = 1000 * 60 * 60 * 24
      var dateNow = new Date().getTime()
      var dateRel = latestRelease * 1000
      return Math.floor((dateNow - dateRel) / day)
    }
    return null
  },
  caniuseUpdateNotifier: function (term) {
    if (!this.notified && term) {
      var interval = term
      if (interval >= 188) {
        console.warn(
          '\n[Browserslist]:\n' +
              'https://github.com/ben-eb/caniuse-lite ' +
              'hasn\'t been updated for more than ' +
              interval + ' days!\n' +
              'To update, run:\n' +
              'npm update caniuse-lite browserslist or' +
              ' yarn upgrade caniuse-lite browserslist\n'
        )
        this.notified = true
        return this.notified
      }
    }
    return null
  }
}
module.exports = updateNotifier
