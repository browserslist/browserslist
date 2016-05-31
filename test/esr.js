import browserslist from '../';

import test from 'ava';

test('selects Firefox ESR', t => {
    t.deepEqual(browserslist('Firefox ESR'), ['firefox 45']);
});

test('uses case insensitive aliases', t => {
    const result = browserslist('Firefox ESR');
    t.deepEqual(browserslist('firefox esr'), result);
    t.deepEqual(browserslist('ff esr'), result);
    t.deepEqual(browserslist('fx esr'), result);
});
