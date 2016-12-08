var browserslist = require('../');

var originData = browserslist.data;

beforeEach(() => {
    browserslist.data = {
        ie: {
            name:     'ie',
            released: ['8', '9', '10', '11'],
            versions: ['8', '9', '10', '11']
        }
    };
});

afterEach(() => {
    browserslist.data = originData;
});

it('selects a range of browsers', () => {
    expect(browserslist('ie 8-10')).toEqual(['ie 10', 'ie 9', 'ie 8']);
});

it('raises on an unknown browser', () => {
    expect(function () {
        browserslist('unknown 4-7');
    }).toThrowError('Unknown browser unknown');
});
