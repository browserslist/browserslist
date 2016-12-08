var browserslist = require('../');

var originData = browserslist.data;

beforeEach(() => {
    browserslist.data = {
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

it('selects versions of browser', () => {
    expect(browserslist('last 2 ie versions')).toEqual(['ie 11', 'ie 10']);
});

it('supports pluralization', () => {
    expect(browserslist('last 1 ie version')).toEqual(['ie 11']);
});

it('has case insensitive aliases', () => {
    expect(browserslist('Last 01 Explorer Version')).toEqual(['ie 11']);
});
