import browserslist from '../';

import test from 'ava';


test('selects opera mini', t => {
    t.deepEqual(browserslist('op_mini all'), ['op_mini all']);
});

test('selects opera mini case insensitive', t => {
    t.deepEqual(browserslist('OperaMini All'), ['op_mini all']);
});
