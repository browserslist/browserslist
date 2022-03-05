var pico = require('picocolors')

var parser = require('./parser')

var NOT_DEAD_QUERY = /^not dead$/i
var LIMITED_BROWSERS_COUNT = 7
var LIMITED_BROWSERS_QUERIES = [
  [parser.QUERY_REGEXP.LAST_BROWSER_MAJOR_VERSIONS, 2],
  [parser.QUERY_REGEXP.LAST_BROWSER_VERSIONS, 2],
  [parser.QUERY_REGEXP.UNRELEASED_BROWSER_VERSIONS, 1],
  [parser.QUERY_REGEXP.BROWSER_RANGE, 1],
  [parser.QUERY_REGEXP.BROWSER_RAY, 1],
  [parser.QUERY_REGEXP.BROWSER_VERSION, 1]
]
var COUNTRIES_1M = [
  'AE', 'AF', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ',
  'BA', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BO',
  'BR', 'BW', 'BY', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI',
  'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CY', 'CZ', 'DE',
  'DK', 'DO', 'EC', 'EE', 'EG', 'ER', 'ES', 'ET', 'FI',
  'FR', 'GA', 'GB', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR',
  'GT', 'GW', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE',
  'IL', 'IN', 'IQ', 'IR', 'IT', 'JM', 'JO', 'JP', 'KE',
  'KG', 'KH', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK',
  'LR', 'LS', 'LT', 'LV', 'LY', 'MA', 'MD', 'MG', 'MK',
  'ML', 'MM', 'MN', 'MR', 'MU', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NZ', 'OM',
  'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PR', 'PS', 'PT',
  'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SD', 'SE',
  'SG', 'SI', 'SK', 'SL', 'SN', 'SO', 'SV', 'SY', 'SZ',
  'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TR', 'TT',
  'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VE', 'VN',
  'YE', 'ZA', 'ZM', 'ZW'
]
var COUNTRIES_MIN_COVERAGE = 80

var rules = [
  {
    id: 'missed-not-dead',
    check: function check(browserslist, queries) {
      var hasLastQuery
      var hasNotDeadQuery

      queries.some(function (query) {
        if (!hasNotDeadQuery && NOT_DEAD_QUERY.test(query)) {
          hasNotDeadQuery = true
        } else if (!hasLastQuery) {
          hasLastQuery = parser.QUERY_REGEXP.LAST_MAJOR_VERSIONS.test(query)
            || parser.QUERY_REGEXP.LAST_VERSIONS.test(query)
        }

        return hasLastQuery && hasNotDeadQuery
      })

      return hasLastQuery && !hasNotDeadQuery
    },
    message: '`not dead` query skipped when using `last N versions` query'
  },
  {
    id: 'limited-browsers',
    check: function check(browserslist, queries) {
      var browsers = []
      var match
      var onlyBrowsersQueries = queries.every(function (query) {
        return LIMITED_BROWSERS_QUERIES.some(function (regexp) {
          match = regexp[0].exec(query)

          if (match) {
            match = match[regexp[1]]

            if (match) {
              if (browsers.indexOf(match) === -1) {
                browsers.push(match)
              }

              return true
            }
          }

          return false
        })
      })

      return onlyBrowsersQueries && browsers.length < LIMITED_BROWSERS_COUNT
    },
    message: 'given config is narrowly limited'
  },
  {
    id: 'country-was-ignored',
    check: function check(browserslist, queries) {
      var coverage
      var countries = []

      COUNTRIES_1M.forEach(function (country) {
        coverage = browserslist.coverage(browserslist(queries), country)

        if (coverage < COUNTRIES_MIN_COVERAGE) {
          countries.push(country)
        }
      })

      return countries.length ? countries : false
    },
    message: function message(meta) {
      var msg = 'given config has poor coverage in '
      var regions = meta.slice(0, 5).join(', ')

      if (meta.length > 5) {
        regions += ' and ' + (meta.length - 5) + ' more regions'
      } else {
        regions = regions.replace(/, (\w+)$/, ' and $1 regions')
      }

      return msg + regions
    }
  }
]

function lint(browserslist, queries) {
  var meta

  return rules.reduce(function (problems, rule) {
    meta = rule.check(browserslist, queries)

    if (meta) {
      problems.push({
        id: rule.id,
        message: typeof rule.message === 'function'
          ? rule.message(meta)
          : rule.message
      })
    }

    return problems
  }, [])
}

function formatReport(problems, source) {
  if (!problems.length) {
    return ''
  }

  var report = source ? '\n' + source + '\n\n' : ''
  var maxProblemIdWidth = problems.reduce(function (prev, problem) {
    return Math.max(prev, problem.id.length)
  }, 0)
  var offset

  report += problems.reduce(function (str, problem) {
    offset = maxProblemIdWidth - problem.id.length + 3
    offset = Array(offset).join(' ')

    return str + pico.yellow('[' + problem.id + ']') + offset + problem.message + '\n'
  }, '')

  report += '\n' + pico.red('✖ ') + problems.length + ' problems'

  return report
}

module.exports = {
  lint: lint,
  formatReport: formatReport
}
