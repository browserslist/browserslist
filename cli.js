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
        'Usage: ' + pkg.name + ' QUERY'
    ].join('\n') + '\n');

} else if ( isArg('--version') ) {
    process.stdout.write(pkg.name + ' ' + pkg.version + '\n');

} else {
    browserslist(args).forEach(function (browser) {
        process.stdout.write(browser + '\n');
    });
}
