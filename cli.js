#!/usr/bin/env node

var browserslist = require('./');
var pkg          = require('./package.json');
var args         = process.argv.slice(2);

function isArg(arg) {
    return args.indexOf(arg) >= 0;
}

if ( args.length === 0 || isArg('--help') >= 0 || isArg('-h') >= 0 ) {
    console.log([
        '',
        pkg.name + ' - ' + pkg.description,
        '',
        'Usage:',
        '',
        '  ' + pkg.name + ' query ...'
    ].join('\n'));
    return;
}

if ( args.indexOf('--version') >= 0 ) {
    console.log(pkg.version);
    return;
}

browserslist(args).forEach(function (browser) {
    console.log(browser);
});
