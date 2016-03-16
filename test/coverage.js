import browserslist from '../';

import test from 'ava';

const originUsage = browserslist.usage;

test.before(() => {
    browserslist.usage = {
        global: {
            'ie 9':  5,
            'ie 10': 10.1
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
