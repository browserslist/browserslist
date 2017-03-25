var spawn = require('child_process').spawn;

var path = require('path');

var browserslist = require('../');
var pkg = require('../package.json');

var CONF = path.join(__dirname, 'fixtures', 'env-config', 'browserslist');
// var STATS = path.join(__dirname, 'fixtures', 'browserslist-stats.json');

var prepareData = (data) => {
    return data.toString().split('\n').filter(Boolean);
};

it('returns help', () => {
    var help = spawn('./cli.js', ['--help']);
    help.stdout.on('data', (data) => {
        expect(data.toString()).toBeDefined();
    });

    var h = spawn('./cli.js', ['-h']);
    h.stdout.on('data', (data) => {
        expect(data.toString()).toBeDefined();
    });
});

it('returns version', () => {
    var result = pkg.name + ' ' + pkg.version + '\n';

    var version = spawn('./cli.js', ['--version']);
    version.stdout.on('data', (data) => {
        expect(data.toString()).toEqual(result);
    });

    var v = spawn('./cli.js', ['-v']);
    v.stdout.on('data', (data) => {
        expect(data.toString()).toEqual(result);
    });
});

it('returns error: `unknown arguments`', () => {
    var cli = spawn('./cli.js', ['-i']);
    cli.stderr.on('data', (data) => {
        expect(data.toString())
        .toContain('Unknown arguments. Use --help to pick right one.');
    });
});

it('selects last 2 versions', () => {
    var query = 'last 2 versions';
    var cli = spawn('./cli.js', [query]);

    cli.stdout.on('data', (data) => {
        expect(prepareData(data)).toEqual(browserslist([query]));
    });
});

it('uses case insensitive aliases', () => {
    var query = 'Explorer > 10';
    var cli = spawn('./cli.js', [query]);

    cli.stdout.on('data', (data) => {
        expect(prepareData(data)).toEqual(browserslist([query]));
    });
});

it('returns error `unknown browser query`', () => {
    var cli = spawn('./cli.js', ['unknow']);

    cli.stderr.on('data', (data) => {
        expect(data.toString())
        .toContain('Unknown browser query `unknow`');
    });
});

it('returns usage in specified country', () => {
    browserslist.usage = {
        global: {
            'ie 8': 5
        },
        UK: {
            'ie 8': 2
        }
    };
    var cli = spawn('./cli.js', ['--coverage=US', 'ie 8']);

    var result  = browserslist.coverage(['ie 8'], 'US');
    var round   = Math.round(result * 100) / 100.0;

    cli.stdout.on('data', (data) => {
        expect(data.toString()).toContain(round + '%');
    });
});

it('returns error: `define a browsers query to get coverage`', () => {
    var cli = spawn('./cli.js', ['--coverage', '']);

    cli.stderr.on('data', (data) => {
        expect(data.toString())
        .toContain('Define a browsers query to get coverage');
    });
});

it('returns error: `unknown browser query to get coverage`', () => {
    var cli = spawn('./cli.js', ['--coverage=UK', 'ie8']);

    cli.stderr.on('data', (data) => {
        expect(data.toString())
        .toContain('Unknown browser query `ie8`');
    });
});

it('reads browserslist config', () => {
    var cli = spawn('./cli.js', ['--config=' + CONF]);

    cli.stdout.on('data', (data) => {
        expect(prepareData(data)).toEqual(['ie 11', 'ie 10']);
    });
});

it('returns error browserslist config', () => {
    var config = '--config="./unknown_path"';
    var cli = spawn('./cli.js', [config]);

    cli.stderr.on('data', (data) => {
        expect(data.toString()).toContain('Can\'t read ./unknown_path config');
    });
});

it('reads browserslist config: env production', () => {
    var config = '--config=' + CONF;
    var env = '--env="production"';
    var cli = spawn('./cli.js', [config, env]);

    cli.stdout.on('data', (data) => {
        expect(prepareData(data)).toEqual(['ie 9', 'opera 41']);
    });
});
