var browserslist = require('../');

var path = require('path');

var FILE    = path.join(__dirname, 'fixtures', 'dir', 'test.css');
var BOTH    = path.join(__dirname, 'fixtures', 'both', 'test.css');
var BROKEN  = path.join(__dirname, 'fixtures', 'broken', 'test.css');
var PACKAGE = path.join(__dirname, 'fixtures', 'package', 'test.css');

var origin = process.cwd();
afterEach(function () {
    process.chdir(origin);
});

it('parses queries', () => {
    expect(browserslist.parseConfig('ie 10\n> 1%')).toEqual({
        defaults: ['ie 10', '> 1%']
    });
});

it('removes comments', () => {
    var config = '# support list\nie 10#bad\n> 1%';
    expect(browserslist.parseConfig(config)).toEqual({
        defaults: ['ie 10', '> 1%']
    });
});

it('supports sections', () => {
    expect(browserslist.parseConfig('ie 10\n[test]\nie 11')).toEqual({
        defaults: ['ie 10'],
        test: ['ie 11']
    });
});

it('trims whitespaces', () => {
    expect(browserslist.parseConfig('ie 9\n\n [ test] \n \n  > 1%\n')).toEqual({
        defaults: ['ie 9'],
        test:     ['> 1%']
    });
});

it('returns undefined on no config', () => {
    expect(browserslist.findConfig(__dirname)).not.toBeDefined();
});

it('reads config', () => {
    expect(browserslist.findConfig(FILE)).toEqual({
        defaults: ['ie 11', 'ie 10']
    });
});

it('reads config from working directory', () => {
    process.chdir(path.dirname(FILE));
    expect(browserslist.findConfig()).toEqual({
        defaults: ['ie 11', 'ie 10']
    });
});

it('ignore working directory on false', () => {
    process.chdir(path.dirname(FILE));
    expect(browserslist.findConfig(false)).not.toBeDefined();
});

it('reads config from package.json', () => {
    expect(browserslist.findConfig(PACKAGE)).toEqual({
        defaults: ['ie 9', 'ie 10']
    });
});

it('shows warning on broken package.json', () => {
    console.warn = jest.fn();
    expect(browserslist.findConfig(BROKEN)).toEqual({
        defaults: ['ie 11', 'ie 10']
    });
    expect(console.warn).toBeCalled();
});

it('reads from dir wich contains both browserslist and package.json', () => {
    expect( () => {
        browserslist.findConfig(BOTH);
    }).toThrowError(/contains both/);
});
