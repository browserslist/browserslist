#!/usr/bin/env node

var browserslist = require('./');
var pkg          = require('./package.json');
var args         = process.argv.slice(2);

function isArg(arg) {
    return args.indexOf(arg) >= 0;
}

function error(msg) {
    process.stderr.write(pkg.name + ': ' + msg + '\n');
    process.exit(1);
}

function query(queries) {
    try {
        return browserslist(queries);
    } catch (e) {
        if ( e.name === 'BrowserslistError' ) {
            error(e.message);
        } else {
            throw e;
        }
    }
}

if ( args.length === 0 || isArg('--help') || isArg('-h') ) {
    process.stdout.write([
        pkg.description,
        '',
        'Usage:',
        '  ' + pkg.name + ' "QUERIES"',
        '  ' + pkg.name + ' --coverage "QUERIES"'
    ].join('\n') + '\n');

} else if ( isArg('--version') || isArg('-v') ) {
    process.stdout.write(pkg.name + ' ' + pkg.version + '\n');

} else if ( isArg('--version') || isArg('-v') ) {
    process.stdout.write(pkg.name + ' ' + pkg.version + '\n');

} else if ( isArg('--coverage') || isArg('-c') ) {
    var browsers = args.find(function (i) {
        return i[0] !== '-';
    });
    if ( !browsers ) error('Define a browsers query to get coverage');
    var result = browserslist.coverage(query(browsers));
    var round  = Math.round(result * 100) / 100.0;
    process.stdout.write(
        'These browsers account for ' + round + '% of all users globally\n');

} else if ( args.length === 1 && args[0][0] !== '-' ) {
    query(args[0]).forEach(function (browser) {
        process.stdout.write(browser + '\n');
    });

} else {
    error('Unknown arguments. Use --help to pick right one.')
}
