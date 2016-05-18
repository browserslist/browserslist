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

test('selects browser by more sign', t => {
    t.deepEqual(browserslist('ie > 9'), ['ie 11', 'ie 10']);
});

test('selects browser by more or equal sign', t => {
    t.deepEqual(browserslist('ie >= 10'), ['ie 11', 'ie 10']);
});

test('selects browser by less sign', t => {
    t.deepEqual(browserslist('ie < 10'), ['ie 9', 'ie 8']);
});

test('selects browser by less or equal sign', t => {
    t.deepEqual(browserslist('ie <= 9'), ['ie 9', 'ie 8']);
});

test('uses case insensitive aliases', t => {
    t.deepEqual(browserslist('Explorer > 10'), ['ie 11']);
});

test('raises on unknown browser', t => {
    t.throws(() => {
        browserslist('unknow > 10');
    }, 'Unknown browser unknow');
});

test('works with joined versions from Can I Use', t => {
    t.deepEqual(browserslist('android >= 4.2'), ['android 4.2-4.3']);
    t.deepEqual(browserslist('android >= 4.3'), ['android 4.2-4.3']);
});
