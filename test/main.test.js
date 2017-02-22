var browserslist = require('../');

var path = require('path');

var IE      = path.join(__dirname, 'fixtures', 'explorers');
var FILE    = path.join(__dirname, 'fixtures', 'dir', 'test.css');
var LINK    = path.join(__dirname, 'fixtures', 'symlink');
var CONFIG  = path.join(__dirname, 'fixtures', 'env-config', 'test.css');
var PACKAGE = path.join(__dirname, 'fixtures', 'env-package', 'test.css');

afterEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.BROWSERSLIST;
    delete process.env.BROWSERSLIST_CONFIG;
    delete process.env.BROWSERSLIST_ENV;
});

it('accepts array', () => {
    expect(browserslist(['ie 11', 'ie 10'])).toEqual(['ie 11', 'ie 10']);
});

it('accepts string', () => {
    expect(browserslist('ie 11, ie 10')).toEqual(['ie 11', 'ie 10']);
});

it('returns unique array', () => {
    expect(browserslist('ie 10, ie 10')).toEqual(['ie 10']);
});

it('returns empty result', () => {
    expect(browserslist([])).toEqual([]);
    expect(browserslist('')).toEqual([]);
});

it('uses environment variable on empty request', () => {
    process.env.BROWSERSLIST = 'ie 10';
    expect(browserslist(null, { path: FILE })).toEqual(['ie 10']);
});

it('reads config on no variable', () => {
    expect(browserslist(null, { path: FILE })).toEqual(['ie 11', 'ie 10']);
});

it('reads config by direct path', () => {
    expect(browserslist(null, { config: IE })).toEqual(['ie 9', 'ie 8']);
});

it('reads config by direct path in environment variable', () => {
    process.env.BROWSERSLIST_CONFIG = IE;
    expect(browserslist(null, { path: FILE })).toEqual(['ie 9', 'ie 8']);
});

it('throw a error on wrong path to config', () => {
    expect(() => {
        browserslist(null, { config: IE + '2' });
    }).toThrowError(/Can't read/);
});

if (!/^win/.test(process.platform)) {
    it('reads config by symlink', () => {
        expect(browserslist(null, { config: LINK })).toEqual(['ie 9', 'ie 8']);
    });
}

it('has default selection', () => {
    expect(browserslist.defaults.length > 0).toBeTruthy();
});

it('uses default selection on empty request and no config', () => {
    expect(browserslist()).toEqual(browserslist(browserslist.defaults));
});

it('raises on unknow query', () => {
    expect(() => {
        browserslist('good');
    }).toThrowError('Unknown browser query `good`');
});

it('sorts browsers', () => {
    expect(browserslist(['ff 10', 'ie 11', 'ie 6', 'ie 10', 'ff 9']))
        .toEqual(['firefox 10', 'firefox 9', 'ie 11', 'ie 10', 'ie 6']);
});

it('sorts browsers with version ranges', () => {
    expect(browserslist(['ios_saf 7', 'ie 11', 'ie 6', 'ios_saf 10']))
        .toEqual(['ie 11', 'ie 6', 'ios_saf 10.0-10.2', 'ios_saf 7.0-7.1']);
});

it('throws custom error', () => {
    var error;
    try {
        browserslist('wrong');
    } catch (e) {
        error = e;
    }
    expect(error.name).toEqual('BrowserslistError');
    expect(typeof error.stack).toEqual('string');
});

it('excludes queries', () => {
    expect(browserslist(['ie >= 9', 'not ie 11', 'not ie 10', 'ie 10']))
        .toEqual(['ie 10', 'ie 9']);
});

it('excludes queries for 0 version', () => {
    var browsers = browserslist(['> 1% in US', 'not last 2 and_chr versions']);
    var android = browsers.filter(i => i.indexOf('and_chr ') !== -1);
    expect(android.length).toBe(0);
});

it('cleans 0 version', () => {
    expect(browserslist(['> 0%', '> 0% in FI']).indexOf('and_chr 0'))
        .toEqual(-1);
});

it('uses env options to browserlist config', () => {
    expect(browserslist(null, { path: CONFIG, env: 'production' }))
        .toEqual(['ie 9', 'opera 41']);

    expect(browserslist(null, { path: CONFIG, env: 'development' }))
        .toEqual(['chrome 55', 'firefox 50']);

    expect(browserslist(null, { path: CONFIG, env: 'test' }))
        .toEqual(['ie 11', 'ie 10']);
});

it('uses env options to package.json', () => {
    expect(browserslist(null, { path: PACKAGE, env: 'production' }))
        .toEqual(['ie 9', 'opera 41']);

    expect(browserslist(null, { path: PACKAGE, env: 'development' }))
        .toEqual(['chrome 55', 'firefox 50']);

    expect(browserslist(null, { path: PACKAGE, env: 'test' }))
        .toEqual(browserslist(browserslist.defaults));
});

it('uses NODE_ENV to get environment', () => {
    process.env.NODE_ENV = 'test';
    expect(browserslist(null, { path: CONFIG }))
        .toEqual(['ie 11', 'ie 10']);
});

it('uses BROWSERSLIST_ENV to get environment', () => {
    process.env.BROWSERSLIST_ENV = 'development';
    expect(browserslist(null, { path: CONFIG }))
         .toEqual(['chrome 55', 'firefox 50']);
});

it('uses development environment by default', () => {
    delete process.env.NODE_ENV;
    expect(browserslist(null, { path: CONFIG }))
        .toEqual(['chrome 55', 'firefox 50']);
});
