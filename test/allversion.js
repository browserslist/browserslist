import browserslist from '../';

import test from 'ava';

const originData = browserslist.data;

test.before(() => {
    browserslist.data = {
        ie: {
            name:     'ie',
            released: ['8', '9', '10', '11'],
            versions: ['8', '9', '10', '11']
        },
        android: {
            name:     'android',
            released: ['4.2-4.3'],
            versions: ['4.2-4.3']
        }
    };
});

test.after(() => {
    browserslist.data = originData;
});

test('include all versions of the browser', t => {
    t.same(browserslist('ie'), ['ie 11', 'ie 10', 'ie 9', 'ie 8']);
});

test('exclude all versions of the browser', t => {
    t.same(browserslist('ie, not ie'), []);
});

test('uses case insensitive aliases', t => {
    t.same(browserslist('Explorer'), ['ie 11', 'ie 10', 'ie 9', 'ie 8']);
    t.same(browserslist('Explorer, not Explorer'), []);
});

test('raises on unknown browser', t => {
    t.throws(() => {
        browserslist('unknow');
    }, 'Unknown browser unknow');
});

test('works with joined versions from Can I Use', t => {
    t.same(browserslist('android'), ['android 4.2-4.3']);
    t.same(browserslist('android, not android'), []);
});
