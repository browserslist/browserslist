import browserslist from '../';

import test from 'ava';
import path from 'path';

const css   = path.join(__dirname, 'fixtures', 'dir', 'test.css');
const ies   = path.join(__dirname, 'fixtures', 'explorers');
const link  = path.join(__dirname, 'fixtures', 'symlink');

test.afterEach(() => {
    delete process.env.BROWSERSLIST;
    delete process.env.BROWSERSLIST_CONFIG;
});

test('accepts array', t => {
    t.deepEqual(browserslist(['ie 11', 'ie 10']), ['ie 11', 'ie 10']);
});

test('accepts string', t => {
    t.deepEqual(browserslist('ie 11, ie 10'), ['ie 11', 'ie 10']);
});

test('returns unique array', t => {
    t.deepEqual(browserslist('ie 10, ie 10'), ['ie 10']);
});

test('returns empty result', t => {
    t.deepEqual(browserslist([]), []);
    t.deepEqual(browserslist(''), []);
});

test.serial('uses environment variable on empty request', t => {
    process.env.BROWSERSLIST = 'ie 10';
    t.deepEqual(browserslist(null, { path: css }), ['ie 10']);
});

test('reads config on no variable', t => {
    t.deepEqual(browserslist(null, { path: css }), ['ie 11', 'ie 10']);
});

test('reads config by direct path', t => {
    t.deepEqual(browserslist(null, { config: ies }), ['ie 9', 'ie 8']);
});

test.serial('reads config by direct path in environment variable', t => {
    process.env.BROWSERSLIST_CONFIG = ies;
    t.deepEqual(browserslist(null, { path: css }), ['ie 9', 'ie 8']);
});

test('throw a error on wrong path to config', t => {
    t.throws(() => {
        browserslist(null, { config: ies + '2' });
    }, /Can't read/);
});

test('reads config by symlink', t => {
    t.deepEqual(browserslist(null, { config: link }), ['ie 9', 'ie 8']);
});

test('has default selection', t => {
    t.truthy(browserslist.defaults.length > 0);
});

test('uses default selection on empty request and no config', t => {
    t.deepEqual(browserslist(), browserslist(browserslist.defaults));
});

test('raises on unknow query', t => {
    t.throws(() => {
        browserslist('good');
    }, 'Unknown browser query `good`');
});

test('sorts browsers', t => {
    t.deepEqual(browserslist(['ff 10', 'ie 11', 'ie 6', 'ie 10', 'ff 9']),
                ['firefox 10', 'firefox 9', 'ie 11', 'ie 10', 'ie 6']);
});

test('has actual example in README.md', t => {
    t.deepEqual(browserslist('last 1 version, > 10%'),
        ['and_chr 50', 'chrome 51', 'chrome 50', 'edge 13', 'firefox 47',
         'ie 11', 'ie_mob 11', 'ios_saf 9.3', 'opera 38', 'safari 9.1']);
});

test('throws custom error', t => {
    let error;
    try {
        browserslist('wrong');
    } catch (e) {
        error = e;
    }
    t.deepEqual(error.name, 'BrowserslistError');
    t.deepEqual(typeof error.stack, 'string');
});

test('excludes queries', t => {
    t.deepEqual(browserslist(['ie >= 9', 'not ie 11', 'not ie 10', 'ie 10']),
                ['ie 10', 'ie 9']);
});

test('clean 0 version', t => {
    t.false(browserslist(['> 0%', '> 0% in FI']).includes('and_chr 0'));
});
