#!/usr/bin/env node

var browserslist = require('./');
var pkg          = require('./package.json');
var args         = process.argv.slice(2);

function isArg(arg) {
    return args.indexOf(arg) >= 0;
}

if ( args.length === 0 || isArg('--help') || isArg('-h') ) {
    process.stdout.write([
        pkg.description,
        '',
        'Usage: ' + pkg.name + ' "QUERIES"'
    ].join('\n') + '\n');

} else if ( isArg('--version') ) {
    process.stdout.write(pkg.name + ' ' + pkg.version + '\n');

} else {
    try {
        browserslist(args[0]).forEach(function (browser) {
            process.stdout.write(browser + '\n');
        });
    } catch (e) {
        if ( e.name === 'BrowserslistError' ) {
            process.stderr.write(pkg.name + ': ' + e.message + '\n');
            process.exit(1);
        } else {
            throw e;
        }
    }
}
