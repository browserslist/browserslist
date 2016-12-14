var browserslist = require('../');

var path = require('path');

var css = path.join(__dirname, 'fixtures', 'dir', 'test.css');
var withBoth = path.join(__dirname, 'fixtures', 'withBoth', 'test.css');
var withPackage = path.join(__dirname, 'fixtures', 'withPackage', 'test.css');

it('parses queries', () => {
    expect(browserslist.parseConfig('ie 10\n> 1%')).toEqual(['ie 10', '> 1%']);
});

it('trims whitespaces', () => {
    expect(browserslist.parseConfig('ie 10 \n \n  > 1%\n'))
        .toEqual(['ie 10', '> 1%']);
});

it('removes comments', () => {
    var config = '# support list\nie 10#bad\n> 1%';
    expect(browserslist.parseConfig(config)).toEqual(['ie 10', '> 1%']);
});

it('returns false on no config', () => {
    expect(browserslist.readConfig(__dirname)).toEqual(false);
});

it('reads config', () => {
    expect(browserslist.readConfig(css)).toEqual(['ie 11', 'ie 10']);
});

it('reads config from package.json', () => {
    expect(browserslist.readConfig(withPackage)).toEqual(['ie 9', 'ie 10']);
});

it('reads from dir wich contains both browserslist and package.json', () => {
    expect( () => {
        browserslist.readConfig(withBoth);
    }).toThrowError(/contains both/);
});
