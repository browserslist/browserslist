import browserslist from '../';

import test from 'ava';

const originUsage = browserslist.usage;

test.before(() => {
    browserslist.usage = {
        global: {
            'ie 9':  5,
            'ie 10': 10.1,
            'ie 11': 75
        }
    };
});

test.after(() => {
    browserslist.usage = originUsage;
});

test('selects browsers by popularity', t => {
    t.deepEqual(browserslist('> 10%'), ['ie 11', 'ie 10']);
});

test('accepts non-space query', t => {
    t.deepEqual(browserslist('>10%'), ['ie 11', 'ie 10']);
});

test('works with float', t => {
    t.deepEqual(browserslist('> 10.2%'), ['ie 11']);
});
