var browserslist = require('../');

var originUsage = browserslist.usage;

beforeEach(() => {
    browserslist.usage = {
        global: {
            'ie 9':  5,
            'ie 10': 10.1,
            'ie 11': 75
        }
    };
});

afterEach(() => {
    browserslist.usage = originUsage;
});

it('selects browsers by popularity', () => {
    expect(browserslist('> 10%')).toEqual(['ie 11', 'ie 10']);
});

it('accepts non-space query', () => {
    expect(browserslist('>10%')).toEqual(['ie 11', 'ie 10']);
});

it('works with float', () => {
    expect(browserslist('> 10.2%')).toEqual(['ie 11']);
});

it('works with float that has a leading dot', () => {
    expect(browserslist('> .2%')).toEqual(['ie 11', 'ie 10', 'ie 9']);
});

it('allows omission of the space between the > and the percentage', () => {
    expect(browserslist('>10%')).toEqual(['ie 11', 'ie 10']);
});
