var spawn = require('cross-spawn');
var path = require('path');

var browserslist = require('../');
var pkg = require('../package.json');

var CONF = path.join(__dirname, 'fixtures', 'env-config', 'browserslist');

function toArray(data) {
    return data.toString().split('\n').filter(Boolean);
}

function run() {
    var cli = spawn('./cli.js', Array.prototype.slice.call(arguments, 0));
    return new Promise(resolve => {
        var out = '';
        cli.stdout.on('data', data => {
            out += data.toString();
        });
        cli.stderr.on('data', data => {
            out += data.toString();
        });
        cli.on('close', () => {
            resolve(out);
        });
    });
}

it('returns help', () => {
    return run('--help').then(out => {
        expect(out).toContain('Usage:');
    }).then(() => {
        return run('-h');
    }).then(out => {
        expect(out).toContain('Usage:');
    });
});

it('returns version', () => {
    var result = pkg.name + ' ' + pkg.version + '\n';
    return run('--version').then(out => {
        expect(out).toEqual(result);
    }).then(() => {
        return run('-v');
    }).then(out => {
        expect(out).toEqual(result);
    });
});

it('returns error: `unknown arguments`', () => {
    return run('--unknown').then(out => {
        expect(out).toContain('Unknown arguments');
    });
});

it('selects last 2 versions', () => {
    var query = 'last 2 versions';
    return run(query).then(out => {
        expect(toArray(out)).toEqual(browserslist([query]));
    });
});

it('uses case insensitive aliases', () => {
    var query = 'Explorer > 10';
    return run(query).then(out => {
        expect(toArray(out)).toEqual(browserslist([query]));
    });
});

it('returns error `unknown browser query`', () => {
    return run('unknow').then(out => {
        expect(out).toContain('Unknown browser query `unknow`');
    });
});

it('returns usage in specified country', () => {
    return run('--coverage=US', 'ie 8').then(out => {
        var result = browserslist.coverage(['ie 8'], 'US');
        var round  = Math.round(result * 100) / 100.0;
        expect(out).toContain(round + '%');
    });
});

it('returns error: `define a browsers query to get coverage`', () => {
    return run('--coverage').then(out => {
        expect(out).toContain('Define a browsers query to get coverage');
    });
});

it('returns error: `unknown browser query to get coverage`', () => {
    return run('--coverage=UK', 'ie8').then(out => {
        expect(out).toContain('Unknown browser query `ie8`');
    });
});

it('reads browserslist config', () => {
    return run('--config=' + CONF).then(out => {
        expect(toArray(out)).toEqual(['ie 11', 'ie 10']);
    });
});

it('returns error browserslist config', () => {
    return run('--config="./unknown_path"').then(out => {
        expect(out).toContain('Can\'t read ./unknown_path config');
    });
});

it('reads browserslist config: env production', () => {
    return run('--config=' + CONF, '--env="production"').then(out => {
        expect(toArray(out)).toEqual(['ie 9', 'opera 41']);
    });
});
