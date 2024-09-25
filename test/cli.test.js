delete require.cache[require.resolve('..')]

let spawn = require('cross-spawn')
let { join } = require('path')
let { test } = require('uvu')
let { is, equal, match } = require('uvu/assert')

let browserslist = require('..')
let pkg = require('../package.json')

let STATS = '--stats=' + join(__dirname, 'fixtures/stats.json')
let CONF = '--config=' + join(__dirname, 'fixtures/env-config/browserslist')

function run(args) {
  let opts = {}
  if (typeof args[0] === 'object') {
    opts = args[0]
    args = []
  }
  let cli = spawn(join(__dirname, '..', 'cli.js'), args, opts)
  return new Promise(resolve => {
    let stdout = ''
    let stderr = ''
    cli.stdout.on('data', data => {
      stdout += data.toString()
    })
    cli.stderr.on('data', data => {
      stderr += data.toString()
    })
    cli.on('close', code => {
      resolve({ code: code || 0, stdout, stderr })
    })
  })
}

async function err(...args) {
  let { code, stdout, stderr } = await run(args)
  is(stdout, '')
  is.not(code, 0)
  return stderr
}

async function out(...args) {
  let { code, stdout, stderr } = await run(args)
  is(stderr, '')
  is(code, 0)
  return stdout
}

async function arr(...args) {
  let stdout = await out(...args)
  return stdout.split('\n').filter(Boolean)
}

function coverage(query, area) {
  let result = browserslist.coverage(query, area)
  return Math.round(result * 100) / 100.0
}

function ie8cov(area) {
  return coverage(['ie 8'], area)
}

test('returns help', async () => {
  match(await out('--help'), 'Usage:')
  match(await out('-h'), 'Usage:')
})

test('returns version', async () => {
  let result = pkg.name + ' ' + pkg.version + '\n'
  is(await out('--version'), result)
  is(await out('-v'), result)
})

test('returns error: `unknown arguments`', async () => {
  match(await err('--unknown'), 'Unknown arguments')
})

test('selects last 2 versions', async () => {
  equal(await arr('last 2 versions'), browserslist('last 2 versions'))
})

test('uses case insensitive aliases', async () => {
  equal(await arr('Explorer > 10'), browserslist('Explorer > 10'))
})

test('returns error `unknown browser query`', async () => {
  is(
    await err('unknow'),
    'browserslist: Unknown browser query `unknow`. ' +
      'Maybe you are using old Browserslist or made typo in query.\n'
  )
})

test('returns usage in specified country', async () => {
  match(
    await out('--coverage=US', 'ie 8'),
    `These browsers account for ${ie8cov('US')}% of all users in the US`
  )
})

test('returns usage in specified ares', async () => {
  let post = '% of all users '
  match(
    await out('--coverage=US,alt-AS,global', 'ie 8'),
    `These browsers account for ${ie8cov('US') + post}in the US\n` +
      `                           ${ie8cov('alt-AS') + post}in the ALT-AS\n` +
      `                           ${ie8cov() + post}globally\n`
  )
})

test('returns error: `unknown browser query to get coverage`', async () => {
  is(
    await err('--coverage=UK', 'ie8'),
    'browserslist: Unknown browser query `ie8`. ' +
      'Maybe you are using old Browserslist or made typo in query.\n'
  )
})

test('reads browserslist config', async () => {
  equal(await arr(CONF), ['ie 11', 'ie 10'])
})

test('reads browserslist config from current directory', async () => {
  let cwd = join(__dirname, 'fixtures')
  equal(await arr({ cwd }), ['ie 11', 'ie 10'])
})

test('returns error browserslist config', async () => {
  is(
    await err('--config="./unknown_path"'),
    "browserslist: Can't read ./unknown_path config\n"
  )
})

test('reads browserslist config: env production', async () => {
  equal(await arr(CONF, '--env="production"'), ['ie 9', 'opera 41'])
})

test('returns usage from config', async () => {
  let result = coverage(['ie 11', 'ie 10'])
  match(await out(CONF, '--coverage'), `${result}`)
})

test('supports custom stats', async () => {
  equal(await arr(STATS, '> 5% in my stats'), ['ie 11', 'ie 10'])
})

test('supports custom stats in coverage', async () => {
  is(
    await out('--coverage', STATS, '> 5% in my stats'),
    'These browsers account for 15.7% of all users in custom statistics\n'
  )
})

test('shows Browserslist error', async () => {
  is(
    await err({ cwd: join(__dirname, 'fixtures', 'wrong1') }),
    'browserslist: Browserslist config ' +
      'should be a string or an array of strings with browser queries\n'
  )
})

test('supports JSON', async () => {
  is(
    await out('--json', '"ie 8"'),
    '{\n  "browsers": [\n    "ie 8"\n  ]\n}\n'
  )
})

test('supports JSON with coverage', async () => {
  is(
    await out('--json', '--coverage=US', '"ie 8"'),
    '{\n' +
      '  "browsers": [\n    "ie 8"\n  ],\n' +
      `  "coverage": {\n    "US": ${ie8cov('US')}\n  }\n` +
      '}\n'
  )
})

test.run()
