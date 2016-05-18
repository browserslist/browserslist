import browserslist from '../';

import test from 'ava';

const originData = browserslist.data;

test.before(() => {
    browserslist.data = {
        ie: {
            name:     'ie',
            released: ['8', '9', '10', '11'],
            versions: ['8', '9', '10', '11']
        }
    };
});

test.after(() => {
    browserslist.data = originData;
});

test('selects a range of browsers', t => {
    t.deepEqual(browserslist('ie 8-10'), ['ie 10', 'ie 9', 'ie 8']);
});

test('raises on an unknown browser', t => {
    t.throws(function () {
        browserslist('unknown 4-7');
    }, 'Unknown browser unknown');
});
