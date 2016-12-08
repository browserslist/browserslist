const browserslist = require('../');

const originUsage = browserslist.usage;

beforeEach(() => {
    browserslist.usage = {
        global: {
            'ie 9':  5,
            'ie 10': 10.1
        },
        UK: {
            'ie 9':  2,
            'ie 10': 4.4
        }
    };
});

afterEach(() => {
    browserslist.usage = originUsage;
});

it('returns browsers coverage', () => {
    expect(browserslist.coverage(['ie 9', 'ie 10'])).toEqual(15.1);
});

it('returns zero coverage on empty browsers', () => {
    expect(browserslist.coverage([])).toEqual(0);
});

it('returns usage in specified country', () => {
    expect(browserslist.coverage(['ie 10'], 'UK')).toEqual(4.4);
});

it('accepts country in any case', () => {
    expect(browserslist.coverage(['ie 10'], 'uk')).toEqual(4.4);
});

it('loads country usage data from Can I Use', () => {
    expect(browserslist.coverage(['ie 9', 'ie 10'], 'US') > 0).toBeTruthy();
});
