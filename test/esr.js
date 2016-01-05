import browserslist from '../';

import test from 'ava';

test('selects Firefox ESR', t => {
    t.same(browserslist('Firefox ESR'), ['firefox 38']);
});

test('uses case insensitive aliases', t => {
    const result = browserslist('Firefox ESR');
    t.same(browserslist('firefox esr'), result);
    t.same(browserslist('ff esr'), result);
    t.same(browserslist('fx esr'), result);
});
