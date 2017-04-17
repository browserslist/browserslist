var browserslist = require('../');

var originData = browserslist.data;

beforeEach(() => {
    browserslist.data = {
        ie: {
            name:     'ie',
            released: ['9', '10', '11'],
            versions: ['9', '10', '11']
        },
        edge: {
            name:     'edge',
            released: ['12'],
            versions: ['12', '13']
        },
        chrome: {
            name:     'chrome',
            released: ['37', '38', '39'],
            versions: ['37', '38', '39', '40']
        },
        bb: {
            name:     'bb',
            released: ['8'],
            versions: ['8']
        },
        firefox: {
            released: []
        },
        safari: {
            released: []
        },
        opera: {
            released: []
        },
        android: {
            released: []
        }
    };
});

afterEach(() => {
    browserslist.data = originData;
});

it('selects versions of each browser', () => {
    expect(browserslist('last 2 versions')).toEqual([
        'bb 8', 'chrome 39', 'chrome 38', 'edge 12', 'ie 11', 'ie 10'
    ]);
});

it('supports pluralization', () => {
    expect(browserslist('last 1 version'))
        .toEqual(['bb 8', 'chrome 39', 'edge 12', 'ie 11']);
});

it('is case insensitive', () => {
    expect(browserslist('Last 01 Version'))
        .toEqual(['bb 8', 'chrome 39', 'edge 12', 'ie 11']);
});
