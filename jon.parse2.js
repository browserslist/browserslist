/* eslint-disable */

const l = console.log

const QueryTypes = {
  initial: 0,
  or: 1,
  and: 2
}

function parse (queries) {
  var qs = []

  do {
    queries = doMatch(queries, qs)
  } while (queries)

  return qs
}

function doMatch (string, qs) {
  var or = /^(?:,|\sor\s)(.*)/i
  var and = /^\sAND\s(.*)/i
  var all = /(.*)/

  return match(
    string,
    function (parsed, n, max) {
      if (and.test(parsed)) {
        qs.unshift(createQuery(QueryTypes.and, parsed.match(and)))
        return true
      } else if(or.test(parsed)) {
        qs.unshift(createQuery(QueryTypes.or, parsed.match(or)))
        return true
      } else if (n === max) {
        qs.unshift(createQuery(QueryTypes.initial, parsed.match(all)))
        return true
      }
    }
  )
}

function match (string, predicate) {
  for (var n = 1, max = string.length; n <= max; n++) {
    const parsed = string.substr(-n, n)
    if (predicate(parsed, n, max)) {
      return string.replace(parsed, '')
    }
  }
}

function createQuery (type, match) {
  const value = match[1].trim()
  return {
    type,
    value
  }
}

var q1 = '> 0.2% and not IE < 11'
var q2 = 'last 2 version, IE 6 and > 1%'
var q3 = 'last 2 versions and not IE < 11 and > 0.2%'
var q4 = '> 1%, not IE < 11, not Chrome < 67, not iOS < 11.4'
var q5 = '> 1% or not IE < 11 or not Chrome < 67 or not iOS < 11.4'
var q6 = '> 0.5%,last 2 versions,Firefox ESR,not dead'
var q7 = 'Explorer > 10'
var q8 = 'last 2 major versions'
var q9 = 'dead'

;([q1, q2, q3, q4, q5, q6, q7, q8, q9]).forEach(function (q) {
  l(q)
  l(parse(q))
})
