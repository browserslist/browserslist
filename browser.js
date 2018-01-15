var BrowserslistError = require('./error')

function noop () { }

module.exports = {
  loadQueries: function loadQueries () {
    throw new BrowserslistError(
      'Sharable configs are not supported in client-side build of Browserslist')
  },

  getStat: function getStat (opts) {
    return opts.stats
  },

  loadConfig: function loadConfig (opts) {
    if (opts.config) {
      throw new BrowserslistError(
        'Browserslist config are not supported in client-side build')
    }
  },

  parseConfig: noop,

  readConfig: noop,

  findConfig: noop,

  clearCaches: noop
}
