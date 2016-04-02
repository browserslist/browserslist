import browserslist from '../';

import test from 'ava';

test('selects browser by name', t => {
    t.same(browserslist('ie 10'), ['ie 10']);
});

test('uses case insensitive aliases', t => {
    const result = browserslist('ie 10');
    t.same(browserslist('Explorer 10'), result);
    t.same(browserslist('IE 10'), result);
});

test('raises on unknown name', t => {
    t.throws(() => {
        browserslist('unknow 10');
    }, 'Unknown browser unknow');
});

test('raises on unknown version', t => {
    t.throws(() => {
        browserslist('IE 1');
    }, 'Unknown version 1 of IE');
});

test('works with joined versions from Can I Use', t => {
    t.same(browserslist('ios 7.0'), ['ios_saf 7.0-7.1']);
    t.same(browserslist('ios 7.1'), ['ios_saf 7.0-7.1']);
});

test('allows to miss zero in version', t => {
    t.same(browserslist('ios 7'), ['ios_saf 7.0-7.1']);
    t.same(browserslist('ios 8.0'), ['ios_saf 8']);
});

test('supports Safari TP', t => {
    t.same(browserslist('safari tp'), ['safari TP']);
    t.same(browserslist('Safari TP'), ['safari TP']);
});
