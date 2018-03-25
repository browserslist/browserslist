var spawn = require('cross-spawn')
var path = require('path')

var browserslist = require('../')
var pkg = require('../package.json')

var STATS = path.join(__dirname, 'fixtures', 'stats.json')
var CONF = path.join(__dirname, 'fixtures', 'env-config', 'browserslist')

function toArray (data) {
  return data.toString().split('\n').filter(Boolean)
}

function run () {
  var args = Array.prototype.slice.call(arguments, 0)
  var opts = { }
  if (typeof args[0] === 'object') {
    opts = args[0]
    args = []
  }
  var cli = spawn(path.join(__dirname, '..', 'cli.js'), args, opts)
  return new Promise(resolve => {
    var out = ''
    cli.stdout.on('data', data => {
      out += data.toString()
    })
    cli.stderr.on('data', data => {
      out += data.toString()
    })
    cli.on('close', () => {
      resolve(out)
    })
  })
}

function err () {
  var args = Array.prototype.slice.call(arguments, 0)
  var opts = { }
  if (typeof args[0] === 'object') {
    opts = args[0]
    args = []
  }
  var cli = spawn(path.join(__dirname, '..', 'cli.js'), args, opts)
  return new Promise(resolve => {
    var error = ''
    var out = ''
    cli.stdout.on('data', data => {
      out += data.toString()
    })
    cli.stderr.on('data', data => {
      error += data.toString()
    })
    cli.on('close', code => {
      expect(out).toEqual('')
      expect(code).not.toEqual(0)
      resolve(error)
    })
  })
}

it('returns help', () => {
  return run('--help').then(out => {
    expect(out).toContain('Usage:')
  }).then(() => {
    return run('-h')
  }).then(out => {
    expect(out).toContain('Usage:')
  })
})

it('returns version', () => {
  var result = pkg.name + ' ' + pkg.version + '\n'
  return run('--version').then(out => {
    expect(out).toEqual(result)
  }).then(() => {
    return run('-v')
  }).then(out => {
    expect(out).toEqual(result)
  })
})

it('returns error: `unknown arguments`', () => {
  return err('--unknown').then(out => {
    expect(out).toContain('Unknown arguments')
  })
})

it('selects last 2 versions', () => {
  var query = 'last 2 versions'
  return run(query).then(out => {
    expect(toArray(out)).toEqual(browserslist([query]))
  })
})

it('uses case insensitive aliases', () => {
  var query = 'Explorer > 10'
  return run(query).then(out => {
    expect(toArray(out)).toEqual(browserslist([query]))
  })
})

it('returns error `unknown browser query`', () => {
  return err('unknow').then(out => {
    expect(out).toEqual('browserslist: Unknown browser query `unknow`\n')
  })
})

it('returns usage in specified country', () => {
  return run('--coverage=US', 'ie 8').then(out => {
    var result = browserslist.coverage(['ie 8'], 'US')
    var round = Math.round(result * 100) / 100.0
    expect(out).toContain(round + '%')
  })
})

it('returns error on missed queries', () => {
  return err('--coverage').then(out => {
    expect(out).toContain('Define queries or config path.\n\nUsage:')
  })
})

it('returns error: `unknown browser query to get coverage`', () => {
  return err('--coverage=UK', 'ie8').then(out => {
    expect(out).toEqual('browserslist: Unknown browser query `ie8`\n')
  })
})

it('reads browserslist config', () => {
  return run('--config=' + CONF).then(out => {
    expect(toArray(out)).toEqual(['ie 11', 'ie 10'])
  })
})

it('reads browserslist config from current directory', () => {
  return run({ cwd: path.join(__dirname, 'fixtures') }).then(out => {
    expect(toArray(out)).toEqual(['ie 11', 'ie 10'])
  })
})

it('returns error browserslist config', () => {
  return err('--config="./unknown_path"').then(out => {
    expect(out).toEqual('browserslist: Can\'t read ./unknown_path config\n')
  })
})

it('reads browserslist config: env production', () => {
  return run('--config=' + CONF, '--env="production"').then(out => {
    expect(toArray(out)).toEqual(['ie 9', 'opera 41'])
  })
})

it('returns usage from config', () => {
  return run('--config=' + CONF, '--coverage').then(out => {
    var result = browserslist.coverage(['ie 11', 'ie 10'])
    var round = Math.round(result * 100) / 100.0
    expect(out).toContain(round + '%')
  })
})

it('supports custom stats', () => {
  return run('--stats=' + STATS, '> 5% in my stats').then(out => {
    expect(toArray(out)).toEqual(['ie 11', 'ie 10'])
  })
})

it('supports custom stats in coverage', () => {
  return run('--coverage', '--stats=' + STATS, '> 5% in my stats').then(out => {
    expect(out).toEqual(
      'These browsers account for 15.7% of all users in custom statistics\n')
  })
})

it('shows Browserslist error', () => {
  return err({ cwd: path.join(__dirname, 'fixtures', 'wrong1') }).then(out => {
    expect(out).toEqual(
      'browserslist: Browserslist config ' +
      'should be a string or an array of strings with browser queries\n'
    )
  })
})
