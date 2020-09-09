var BrowserslistError = require('./error')

function unknownQuery (query) {
  return new BrowserslistError(
    'Unknown browser query `' + query + '`. ' +
    'Maybe you are using old Browserslist or made typo in query.'
  )
}
exports.unknownQuery = unknownQuery
