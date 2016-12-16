var browserslist = require('../');

var path = require('path');

var css = path.join(__dirname, 'fixtures', 'dir', 'test.css');
var withBoth = path.join(__dirname, 'fixtures', 'withBoth', 'test.css');
var withPackage = path.join(__dirname, 'fixtures', 'withPackage', 'test.css');
var withSections = path.join(__dirname, 'fixtures', 'withSections', 'test.css');

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

it('reads config with sections wihout env', () => {
    // by default env is development
    expect(browserslist.readConfig(withSections))
        .toEqual(['ie 10', 'ie 11', 'chrome 53']);
});

it('reads config with specific env', () => {
    expect(browserslist.readConfig(withSections, 'custom'))
        .toEqual(['chrome 51', 'ff 42']);
    expect(browserslist.readConfig(withSections, 'production'))
        .toEqual(['ie 11', 'ie 10']);
    expect(browserslist.readConfig(withSections, 'development'))
        .toEqual(['ie 10', 'ie 11', 'chrome 53']);
});
