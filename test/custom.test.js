var browserslist = require('../');

var path = require('path');
var fs   = require('fs');

var usage = path.join(__dirname, 'fixtures', 'stats.json');

afterEach(() => {
    delete process.env.BROWSERSLIST_STATS;
});

it('throws error on invalid file', () => {
    expect(() => {
        browserslist('', { stats: 'no.json' });
    }).toThrowError('Can\'t read no.json');
});

it('takes stats file from environment variable', () => {
    process.env.BROWSERSLIST_STATS = usage;
    expect(browserslist('> 10% in my stats')).toEqual(['ie 11']);
});

it('takes stats by path', () => {
    expect(browserslist('> 10% in my stats', { stats: usage }))
        .toEqual(['ie 11']);
});

it('accepts non-space query', () => {
    expect(browserslist('>10% in my stats', { stats: usage }))
        .toEqual(['ie 11']);
});

it('take stats from usage data object', () => {
    var data = JSON.parse(fs.readFileSync(usage));
    expect(browserslist('> 10% in my stats', { stats: data }))
        .toEqual(['ie 11']);
});

it('works alongside global usage query', () => {
    let list = browserslist('> 10% in my stats, > 1%', { stats: usage });
    expect(list.length > 1).toBeTruthy();
});
