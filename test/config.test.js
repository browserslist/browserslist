var browserslist = require('../');

var path = require('path');

var css = path.join(__dirname, 'fixtures', 'dir', 'test.css');
var withBoth = path.join(__dirname, 'fixtures', 'withBoth', 'test.css');
var withPackage = path.join(__dirname, 'fixtures', 'withPackage', 'test.css');

it('parses queries', () => {
    expect(browserslist.parseConfig('ie 10\n> 1%')).toEqual({
        defaults: ['ie 10', '> 1%']
    });
});

it('parses chapters queries', () => {
    var config =
        '\nie 10\n> 1%\n[development]\nie 10\n> 1%\n[production]\nie 10\n> 1%';
    expect(browserslist.parseConfig(config)).toEqual({
        defaults: ['ie 10', '> 1%'],
        development: ['ie 10', '> 1%'],
        production: ['ie 10', '> 1%']
    });
});

it('trims whitespaces', () => {
    expect(browserslist.parseConfig('ie 10 \n \n  > 1%\n'))
        .toEqual({ defaults: ['ie 10', '> 1%'] });
});

it('removes comments', () => {
    var config = '# support list\nie 10#bad\n> 1%';
    expect(browserslist.parseConfig(config)).toEqual({
        defaults: ['ie 10', '> 1%']
    });
});

it('reads config', () => {
    expect(browserslist.readConfig(css)).toEqual({
        defaults: ['ie 11', 'ie 10']
    });
});

it('reads config from package.json', () => {
    expect(browserslist.readConfig(withPackage)).toEqual(['ie 9', 'ie 10']);
});

it('reads from dir wich contains both browserslist and package.json', () => {
    expect( () => {
        browserslist.readConfig(withBoth);
    }).toThrowError(/contains both/);
});
