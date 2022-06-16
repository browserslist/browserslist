var QUERY_OR = 1
var QUERY_AND = 2

var QUERY_REGEXPS = {
  LAST_MAJOR_VERSIONS: /^last\s+(\d+)\s+major\s+versions?$/i,
  LAST_VERSIONS: /^last\s+(\d+)\s+versions?$/i,
  LAST_ELECTRON_MAJOR_VERSIONS: /^last\s+(\d+)\s+electron\s+major\s+versions?$/i,
  LAST_NODE_MAJOR_VERSIONS: /^last\s+(\d+)\s+node\s+major\s+versions?$/i,
  LAST_BROWSER_MAJOR_VERSIONS: /^last\s+(\d+)\s+(\w+)\s+major\s+versions?$/i,
  LAST_ELECTRON_VERSIONS: /^last\s+(\d+)\s+electron\s+versions?$/i,
  LAST_NODE_VERSIONS: /^last\s+(\d+)\s+node\s+versions?$/i,
  LAST_BROWSER_VERSIONS: /^last\s+(\d+)\s+(\w+)\s+versions?$/i,
  UNRELEASED_VERSIONS: /^unreleased\s+versions$/i,
  UNRELEASED_ELECTRON_VERSIONS: /^unreleased\s+electron\s+versions?$/i,
  UNRELEASED_BROWSER_VERSIONS: /^unreleased\s+(\w+)\s+versions?$/i,
  LAST_YEARS: /^last\s+(\d*.?\d+)\s+years?$/i,
  SINCE_Y: /^since (\d+)$/i,
  SINCE_Y_M:  /^since (\d+)-(\d+)$/i,
  SINCE_Y_M_D: /^since (\d+)-(\d+)-(\d+)$/i,
  POPULARITY: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%$/,
  POPULARITY_IN_MY_STATS: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%\s+in\s+my\s+stats$/,
  POPULARITY_IN_CONFIG_STATS: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%\s+in\s+(\S+)\s+stats$/,
  POPULARITY_IN_COUNTRY: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%\s+in\s+((alt-)?\w\w)$/,
  COVER: /^cover\s+(\d+|\d+\.\d+|\.\d+)%$/i,
  COVER_IN: /^cover\s+(\d+|\d+\.\d+|\.\d+)%\s+in\s+(my\s+stats|(alt-)?\w\w)$/i,
  SUPPORTS: /^supports\s+([\w-]+)$/,
  ELECTRON_RANGE: /^electron\s+([\d.]+)\s*-\s*([\d.]+)$/i,
  NODE_RANGE: /^node\s+([\d.]+)\s*-\s*([\d.]+)$/i,
  BROWSER_RANGE: /^(\w+)\s+([\d.]+)\s*-\s*([\d.]+)$/i,
  ELECTRON_RAY: /^electron\s*(>=?|<=?)\s*([\d.]+)$/i,
  NODE_RAY: /^node\s*(>=?|<=?)\s*([\d.]+)$/i,
  BROWSER_RAY: /^(\w+)\s*(>=?|<=?)\s*([\d.]+)$/,
  FIREFOX_ESR: /^(firefox|ff|fx)\s+esr$/i,
  OPERA_MINI: /(operamini|op_mini)\s+all/i,
  ELECTRON_VERSION: /^electron\s+([\d.]+)$/i,
  NODE_MAJOR_VERSION: /^node\s+(\d+)$/i,
  NODE_MINOR_VERSION: /^node\s+(\d+\.\d+)$/i,
  NODE_PATCH_VERSION: /^node\s+(\d+\.\d+\.\d+)$/i,
  NODE_CURRENT_VERSION: /^current\s+node$/i,
  NODE_MAINTAINED_VERSIONS: /^maintained\s+node\s+versions$/i,
  PHANTOMJS_1_9: /^phantomjs\s+1.9$/i,
  PHANTOMJS_2_1: /^phantomjs\s+2.1$/i,
  BROWSER_VERSION: /^(\w+)\s+(tp|[\d.]+)$/i,
  BROWSERSLIST_CONFIG: /^browserslist config$/i,
  EXTENDS: /^extends (.+)$/i,
  DEFAULTS: /^defaults$/i,
  DEAD: /^dead$/i,
  UNKNOWN: /^(\w+)$/i
}

function parse(queries) {
  var qs = []
  do {
    queries = doMatch(queries, qs)
  } while (queries)
  return qs
}

function doMatch(string, qs) {
  var or = /^(?:,\s*|\s+or\s+)(.*)/i
  var and = /^\s+and\s+(.*)/i

  return find(string, function (parsed, n, max) {
    if (and.test(parsed)) {
      qs.unshift({ type: QUERY_AND, queryString: parsed.match(and)[1] })
      return true
    } else if (or.test(parsed)) {
      qs.unshift({ type: QUERY_OR, queryString: parsed.match(or)[1] })
      return true
    } else if (n === max) {
      qs.unshift({ type: QUERY_OR, queryString: parsed.trim() })
      return true
    }
    return false
  })
}

function find(string, predicate) {
  for (var n = 1, max = string.length; n <= max; n++) {
    var parsed = string.substr(-n, n)
    if (predicate(parsed, n, max)) {
      return string.slice(0, -n)
    }
  }
  return ''
}

module.exports = {
  QUERY_OR: QUERY_OR,
  QUERY_AND: QUERY_AND,
  QUERY_REGEXPS: QUERY_REGEXPS,
  parse: parse
}
