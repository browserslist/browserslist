var browserslist = require('../');

var path = require('path');
var fs   = require('fs');

var CUSTOM_STATS = path.join(__dirname, 'fixtures', 'stats.json');
var STATS        = path.join(__dirname, 'fixtures', 'browserslist-stats.json');

afterEach(() => {
    delete process.env.BROWSERSLIST_STATS;
});

it('throws error on invalid file', () => {
    expect(() => {
        browserslist('', { stats: 'no.json' });
    }).toThrowError('Can\'t read no.json');
});

it('takes stats file from environment variable', () => {
    process.env.BROWSERSLIST_STATS = CUSTOM_STATS;
    expect(browserslist('> 10% in my stats')).toEqual(['ie 11']);
});

it('takes stats by path', () => {
    expect(browserslist('> 10% in my stats', { stats: CUSTOM_STATS }))
        .toEqual(['ie 11']);
});

it('accepts non-space query', () => {
    expect(browserslist('>10% in my stats', { stats: CUSTOM_STATS }))
        .toEqual(['ie 11']);
});

it('take stats from usage data object', () => {
    var data = JSON.parse(fs.readFileSync(CUSTOM_STATS));
    expect(browserslist('> 10% in my stats', { stats: data }))
        .toEqual(['ie 11']);
});

it('works alongside global usage query', () => {
    var list = browserslist('> 10% in my stats, > 1%', { stats: CUSTOM_STATS });
    expect(list.length > 1).toBeTruthy();
});

it('take stats from browserslist-stats.json', () => {
    expect(browserslist('> 5% in my stats', { path: STATS })).toEqual(['ie 8']);
});

it('throws error on no stats', () => {
    expect(function () {
        browserslist('> 5% in my stats');
    }).toThrowError(/statistics was not provided/);
});
