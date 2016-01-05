import browserslist from '../';

import test from 'ava';

const originData = browserslist.data;

test.before(() => {
    browserslist.data = {
        ie: {
            name:     'ie',
            released: ['9', '10', '11'],
            versions: ['9', '10', '11']
        }
    };
});

test.after(() => {
    browserslist.data = originData;
});

test('selects versions of browser', t => {
    t.same(browserslist('last 2 ie versions'), ['ie 11', 'ie 10']);
});

test('supports pluralization', t => {
    t.same(browserslist('last 1 ie version'), ['ie 11']);
});

test('has case insensitive aliases', t => {
    t.same(browserslist('Last 01 Explorer Version'), ['ie 11']);
});
