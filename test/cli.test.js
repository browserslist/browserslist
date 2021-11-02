let { join } = require('path')
let spawn = require('cross-spawn')

let browserslist = require('..')
let pkg = require('../package.json')

let STATS = '--stats=' + join(__dirname, 'fixtures/stats.json')
let CONF = '--config=' + join(__dirname, 'fixtures/env-config/browserslist')

function run (args) {
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

async function err (...args) {
  let { code, stdout, stderr } = await run(args)
  expect(stdout).toEqual('')
  expect(code).not.toEqual(0)
  return stderr
}

async function out (...args) {
  let { code, stdout, stderr } = await run(args)
  expect(stderr).toEqual('')
  expect(code).toEqual(0)
  return stdout
}

async function arr (...args) {
  let stdout = await out(...args)
  return stdout.split('\n').filter(Boolean)
}

function coverage (query, area) {
  let result = browserslist.coverage(query, area)
  return Math.round(result * 100) / 100.0
}

function ie8cov (area) {
  return coverage(['ie 8'], area)
}

it('returns help', async () => {
  expect(await out('--help')).toContain('Usage:')
  expect(await out('-h')).toContain('Usage:')
})

it('returns version', async () => {
  let result = pkg.name + ' ' + pkg.version + '\n'
  expect(await out('--version')).toEqual(result)
  expect(await out('-v')).toEqual(result)
})

it('returns error: `unknown arguments`', async () => {
  expect(await err('--unknown')).toContain('Unknown arguments')
})

it('selects last 2 versions', async () => {
  expect(await arr('last 2 versions')).toEqual(browserslist('last 2 versions'))
})

it('uses case insensitive aliases', async () => {
  expect(await arr('Explorer > 10')).toEqual(browserslist('Explorer > 10'))
})

it('returns error `unknown browser query`', async () => {
  expect(await err('unknow')).toEqual(
    'browserslist: Unknown browser query `unknow`. ' +
      'Maybe you are using old Browserslist or made typo in query.\n'
  )
})

it('returns usage in specified country', async () => {
  expect(await out('--coverage=US', 'ie 8')).toContain(
    `These browsers account for ${ ie8cov('US') }% of all users in the US`
  )
})

it('returns usage in specified ares', async () => {
  let post = '% of all users '
  expect(await out('--coverage=US,alt-AS,global', 'ie 8')).toContain(
    `These browsers account for ${ ie8cov('US') + post }in the US\n` +
      `                           ${ ie8cov('alt-AS') + post }in the ALT-AS\n` +
      `                           ${ ie8cov() + post }globally\n`
  )
})

it('returns error: `unknown browser query to get coverage`', async () => {
  expect(await err('--coverage=UK', 'ie8')).toEqual(
    'browserslist: Unknown browser query `ie8`. ' +
      'Maybe you are using old Browserslist or made typo in query.\n'
  )
})

it('reads browserslist config', async () => {
  expect(await arr(CONF)).toEqual(['ie 11', 'ie 10'])
})

it('reads browserslist config from current directory', async () => {
  let cwd = join(__dirname, 'fixtures')
  expect(await arr({ cwd })).toEqual(['ie 11', 'ie 10'])
})

it('returns error browserslist config', async () => {
  expect(await err('--config="./unknown_path"')).toEqual(
    "browserslist: Can't read ./unknown_path config\n"
  )
})

it('reads browserslist config: env production', async () => {
  expect(await arr(CONF, '--env="production"')).toEqual(['ie 9', 'opera 41'])
})

it('returns usage from config', async () => {
  let result = coverage(['ie 11', 'ie 10'])
  expect(await out(CONF, '--coverage')).toContain(`${ result }`)
})

it('supports custom stats', async () => {
  expect(await arr(STATS, '> 5% in my stats')).toEqual(['ie 11', 'ie 10'])
})

it('supports custom stats in coverage', async () => {
  expect(await out('--coverage', STATS, '> 5% in my stats')).toEqual(
    'These browsers account for 15.7% of all users in custom statistics\n'
  )
})

it('shows Browserslist error', async () => {
  expect(await err({ cwd: join(__dirname, 'fixtures', 'wrong1') })).toEqual(
    'browserslist: Browserslist config ' +
      'should be a string or an array of strings with browser queries\n'
  )
})

it('supports JSON', async () => {
  expect(await out('--json', '"ie 8"')).toEqual(
    '{\n  "browsers": [\n    "ie 8"\n  ]\n}\n'
  )
})

it('supports JSON with coverage', async () => {
  expect(await out('--json', '--coverage=US', '"ie 8"')).toEqual(
    '{\n' +
      '  "browsers": [\n    "ie 8"\n  ],\n' +
      `  "coverage": {\n    "US": ${ ie8cov('US') }\n  }\n` +
      '}\n'
  )
})
