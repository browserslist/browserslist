import browserslist from '../';

import test from 'ava';

const originData = browserslist.data;

test.before(() => {
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
        blackberry: {
            name:     'blackberry',
            released: ['8'],
            versions: []
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

test.after(() => {
    browserslist.data = originData;
});

test('selects versions of each major browser', t => {
    t.same(browserslist('last 2 versions'),
           ['chrome 39', 'chrome 38', 'edge 12', 'ie 11', 'ie 10']);
});

test('supports pluralization', t => {
    t.same(browserslist('last 1 version'), ['chrome 39', 'edge 12', 'ie 11']);
});

test('is case insensitive', t => {
    t.same(browserslist('Last 01 Version'), ['chrome 39', 'edge 12', 'ie 11']);
});
