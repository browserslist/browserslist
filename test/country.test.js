var browserslist = require('../');

var originUsage = browserslist.usage;

beforeEach(() => {
    browserslist.usage = {
        US: {
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
    expect(browserslist('> 10% in US')).toEqual(['ie 11', 'ie 10']);
});

it('works with float', () => {
    expect(browserslist('> 10.2% in US')).toEqual(['ie 11']);
});

it('works with float that has a leading dot', () => {
    expect(browserslist('> .2% in US')).toEqual(['ie 11', 'ie 10', 'ie 9']);
});

it('fixes country case', () => {
    expect(browserslist('> 10.2% in us')).toEqual(['ie 11']);
});

it('loads country from Can I Use', () => {
    expect(browserslist('> 1% in RU').length > 0).toBeTruthy();
});

it('allows omission of the space between the > and the percentage', () => {
    expect(browserslist('>10% in US').length > 0).toBeTruthy();
});
