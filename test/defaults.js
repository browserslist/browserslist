import browserslist from '../';

import test from 'ava';

test('selects defaults by keywords', t => {
    t.deepEqual(browserslist('defaults, ie 6'),
                browserslist(browserslist.defaults.concat(['ie 6'])));
});
