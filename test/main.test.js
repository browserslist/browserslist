var browserslist = require('../');

var path = require('path');

var css  = path.join(__dirname, 'fixtures', 'dir', 'test.css');
var ies  = path.join(__dirname, 'fixtures', 'explorers');
var link = path.join(__dirname, 'fixtures', 'symlink');

afterEach(() => {
    delete process.env.BROWSERSLIST;
    delete process.env.BROWSERSLIST_CONFIG;
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
    expect(browserslist(null, { path: css })).toEqual(['ie 10']);
});

it('reads config on no variable', () => {
    expect(browserslist(null, { path: css })).toEqual(['ie 11', 'ie 10']);
});

it('reads config by direct path', () => {
    expect(browserslist(null, { config: ies })).toEqual(['ie 9', 'ie 8']);
});

it('reads config by direct path in environment variable', () => {
    process.env.BROWSERSLIST_CONFIG = ies;
    expect(browserslist(null, { path: css })).toEqual(['ie 9', 'ie 8']);
});

it('throw a error on wrong path to config', () => {
    expect(() => {
        browserslist(null, { config: ies + '2' });
    }).toThrowError(/Can't read/);
});

if (!/^win/.test(process.platform)) {
    it('reads config by symlink', () => {
        expect(browserslist(null, { config: link })).toEqual(['ie 9', 'ie 8']);
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

it('has actual example in README.md', () => {
    expect(browserslist('last 1 version, > 10%')).toEqual([
        'and_chr 54', 'chrome 55', 'chrome 54', 'edge 14', 'firefox 50',
        'ie 11', 'ie_mob 11', 'ios_saf 10-10.1', 'opera 41', 'safari 10'
    ]);
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

it('clean 0 version', () => {
    expect(browserslist(['> 0%', '> 0% in FI']).indexOf('and_chr 0'))
        .toEqual(-1);
});
