var browserslist = require('../');

var originUsage = browserslist.usage;

beforeEach(() => {
    browserslist.usage = {
        global: {
            'ie 8': 5,
            'ie 9': 10.1
        },
        UK: {
            'ie 8': 2,
            'ie 9': 4.4
        },
        RU: {
            'ie 0': 2
        }
    };
});

afterEach(() => {
    browserslist.usage = originUsage;
});

it('returns browsers coverage', () => {
    expect(browserslist.coverage(['ie 8', 'ie 9'])).toEqual(15.1);
});

it('returns zero coverage on empty browsers', () => {
    expect(browserslist.coverage([])).toEqual(0);
});

it('returns usage in specified country', () => {
    expect(browserslist.coverage(['ie 9'], 'UK')).toEqual(4.4);
});

it('accepts country in any case', () => {
    expect(browserslist.coverage(['ie 9'], 'uk')).toEqual(4.4);
});

it('loads country usage data from Can I Use', () => {
    expect(browserslist.coverage(['ie 8', 'ie 9'], 'US') > 0).toBeTruthy();
});

it('fixes statistics of 0 version', () => {
    expect(browserslist.coverage(['ie 9'], 'RU')).toEqual(2);
});
