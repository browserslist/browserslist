import browserslist from '../';

import test from 'ava';

const originUsage = browserslist.usage;

test.before(() => {
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

test.after(() => {
    browserslist.usage = originUsage;
});

test('returns browsers coverage', t => {
    t.same(browserslist.coverage(['ie 9', 'ie 10']), 15.1);
});

test('returns zero coverage on empty browsers', t => {
    t.same(browserslist.coverage([]), 0);
});

test('returns usage in specified country', t => {
    t.same(browserslist.coverage(['ie 10'], 'UK'), 4.4);
});

test('accepts country in any case', t => {
    t.same(browserslist.coverage(['ie 10'], 'uk'), 4.4);
});

test('loads country usage data from Can I Use', t => {
    t.ok(browserslist.coverage(['ie 9', 'ie 10'], 'US') > 0);
});
