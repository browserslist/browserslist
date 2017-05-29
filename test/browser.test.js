var browserslist = require('../');

var originData = browserslist.data;

beforeEach(() => {
    browserslist.data = {
        edge: {
            name:     'edge',
            released: ['12', '13', '14', '15'],
            versions: ['12', '13', '14', '15']
        },
        ie: {
            name:     'ie',
            released: ['9', '10', '11'],
            versions: ['9', '10', '11']
        }
    };
});

afterEach(() => {
    browserslist.data = originData;
});

it('selects all versions of browser', () => {
    expect(browserslist('all ie')).toEqual(['ie 11', 'ie 10', 'ie 9']);
});

it('selects all versions of all browsers', () => {
    expect(browserslist('all')).toEqual([
        'edge 15', 'edge 14', 'edge 13', 'edge 12', 'ie 11', 'ie 10', 'ie 9'
    ]);
});

it('selects versions of browser', () => {
    expect(browserslist('last 2 ie versions')).toEqual(['ie 11', 'ie 10']);
});

it('supports pluralization', () => {
    expect(browserslist('last 1 ie version')).toEqual(['ie 11']);
});

it('has case insensitive aliases', () => {
    expect(browserslist('Last 01 Explorer Version')).toEqual(['ie 11']);
});
