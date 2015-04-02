var browserslist = require('../');
var expect       = require('chai').expect;
var path         = require('path');

var originData  = browserslist.data;
var originUsage = browserslist.usage;

var config = path.join(__dirname, 'fixtures', 'dir', 'test.css');

describe('browserslist', function () {

    afterEach(function () {
        browserslist.data  = originData;
        browserslist.usage = originUsage;
        delete process.env.BROWSERSLIST;
    });

    it('accepts array', function () {
        expect(browserslist(['ie 11', 'ie 10'])).to.eql(['ie 11', 'ie 10']);
    });

    it('accepts string', function () {
        expect(browserslist('ie 11, ie 10')).to.eql(['ie 11', 'ie 10']);
    });

    it('returns unique array', function () {
        expect(browserslist('ie 10, ie 10')).to.eql(['ie 10']);
    });

    it('returns empty result', function () {
        expect(browserslist([])).to.eql([]);
        expect(browserslist('')).to.eql([]);
    });

    it('uses environment variable on empty request', function () {
        process.env.BROWSERSLIST = 'ie 10';
        expect(browserslist(null, { path: config })).to.eql(['ie 10']);
    });

    it('reads config on no variable', function () {
        expect(browserslist(null, { path: config })).to.eql(['ie 11', 'ie 10']);
    });

    it('has default selection', function () {
        expect(browserslist.defaults.length).to.not.be.empty;
    });

    it('uses default selection on empty request and no config', function () {
        expect(browserslist())
            .to.eql(browserslist(browserslist.defaults));
    });

    it('raises on unknow query', function () {
        expect(function () {
            browserslist('good');
        }).to.throw('Unknown browser query `good`');
    });

    it('sorts browsers', function () {
        expect(browserslist(['ff 10', 'ie 11', 'ie 6', 'ie 10', 'ff 9']))
            .to.eql(['firefox 10', 'firefox 9', 'ie 11', 'ie 10', 'ie 6']);
    });

    it('has actual example in README.md', function () {
        expect(browserslist('last 1 version, > 5%')).to.eql(
            ['and_chr 41', 'chrome 41', 'chrome 40', 'firefox 36',
             'ie 11', 'ie_mob 11', 'ios_saf 8.1', 'opera 27', 'safari 8']);
    });

    describe('ESR query', function () {

        it('selects Firefox ESR', function () {
            expect(browserslist('Firefox ESR')).to.eql(['firefox 31']);
        });

        it('uses case insensitive aliases', function () {
            var result = browserslist('Firefox ESR');
            expect(browserslist('firefox esr')).to.eql(result);
            expect(browserslist('ff esr')).to.eql(result);
            expect(browserslist('fx esr')).to.eql(result);
        });

    });

    describe('direct query', function () {

        it('selects browser by name', function () {
            expect(browserslist('ie 10')).to.eql(['ie 10']);
        });

        it('uses case insensitive aliases', function () {
            var result = browserslist('ie 10');
            expect(browserslist('Explorer 10')).to.eql(result);
            expect(browserslist('IE 10')).to.eql(result);
        });

        it('raises on unknown name', function () {
            expect(function () {
                browserslist('unknow 10');
            }).to.throw('Unknown browser unknow');
        });

        it('raises on unknown version', function () {
            expect(function () {
                browserslist('IE 1');
            }).to.throw('Unknown version 1 of IE');
        });

        it('works with joined versions from Can I Use', function () {
            expect(browserslist('ios 7.0')).to.eql(['ios_saf 7.0-7.1']);
            expect(browserslist('ios 7.1')).to.eql(['ios_saf 7.0-7.1']);
        });

        it('allows to miss zero in version', function () {
            expect(browserslist('ios 7')).to.eql(['ios_saf 7.0-7.1']);
            expect(browserslist('ios 8.0')).to.eql(['ios_saf 8']);
        });

    });

    describe('versions query', function () {

        beforeEach(function () {
            browserslist.data = {
                ie: {
                    name:      'ie',
                    released: ['8', '9', '10', '11'],
                    versions: ['8', '9', '10', '11', '12']
                }
            };
        });

        it('selects browser by more sign', function () {
            expect(browserslist('ie > 9')).to.eql(['ie 11', 'ie 10']);
        });

        it('selects browser by more or equal sign', function () {
            expect(browserslist('ie >= 10')).to.eql(['ie 11', 'ie 10']);
        });

        it('selects browser by less sign', function () {
            expect(browserslist('ie < 10')).to.eql(['ie 9', 'ie 8']);
        });

        it('selects browser by less or equal sign', function () {
            expect(browserslist('ie <= 9')).to.eql(['ie 9', 'ie 8']);
        });

        it('uses case insensitive aliases', function () {
            expect(browserslist('Explorer > 10')).to.eql(['ie 11']);
        });

        it('raises on unknown browser', function () {
            expect(function () {
                browserslist('unknow > 10');
            }).to.throw('Unknown browser unknow');
        });

        it('works with joined versions from Can I Use', function () {
            browserslist.data = originData;
            expect(browserslist('android >= 4.2')).to.include('android 4.2-4.3');
            expect(browserslist('android >= 4.3')).to.include('android 4.2-4.3');
        });

    });

    describe('last n version query', function () {

        beforeEach(function () {
            browserslist.data = {
                ie: {
                    name:      'ie',
                    released: ['9', '10', '11'],
                    versions: ['9', '10', '11', '12']
                },
                chrome: {
                    name:      'chrome',
                    released: ['37', '38', '39'],
                    versions: ['37', '38', '39', '40']
                },
                blackberry: {
                    name:      'blackberry',
                    released: ['8'],
                    versions: []
                },
                firefox: {
                    released: []
                },
                safari: {
                    released: []
                },
                opera: {
                    released: []
                },
                android: {
                    released: []
                }
            };
        });

        it('selects versions of each major browser', function () {
            expect(browserslist('last 2 versions'))
                .to.eql(['chrome 39', 'chrome 38', 'ie 11', 'ie 10']);
        });

        it('supports pluralization', function () {
            expect(browserslist('last 1 version'))
                .to.eql(['chrome 39', 'ie 11']);
        });

        it('is case insensitive', function () {
            expect(browserslist('Last 01 Version'))
                .to.eql(['chrome 39', 'ie 11']);
        });

    });

    describe('last n version of browser query', function () {

        beforeEach(function () {
            browserslist.data = {
                ie: {
                    name:      'ie',
                    released: ['9', '10', '11'],
                    versions: ['9', '10', '11', '12']
                }
            };
        });

        it('selects versions of browser', function () {
            expect(browserslist('last 2 ie versions'))
                .to.eql(['ie 11', 'ie 10']);
        });

        it('supports pluralization', function () {
            expect(browserslist('last 1 ie version')).to.eql(['ie 11']);
        });

        it('has case insensitive aliases', function () {
            expect(browserslist('Last 01 Explorer Version')).to.eql(['ie 11']);
        });

    });

    describe('global statistics query', function () {

        beforeEach(function () {
            browserslist.usage = {
                global: {
                    'ie 9':  5,
                    'ie 10': 10.1,
                    'ie 11': 75
                }
            };
        });

        it('selects browsers by popularity', function () {
            expect(browserslist('> 10%')).to.eql(['ie 11', 'ie 10']);
        });

        it('works with float', function () {
            expect(browserslist('> 10.2%')).to.eql(['ie 11']);
        });
    });

    describe('country statistics query', function () {

        beforeEach(function () {
            browserslist.usage = {
                US: {
                    'ie 9':  5,
                    'ie 10': 10.1,
                    'ie 11': 75
                }
            };
        });

        it('selects browsers by popularity', function () {
            expect(browserslist('> 10% in US')).to.eql(['ie 11', 'ie 10']);
        });

        it('works with float', function () {
            expect(browserslist('> 10.2% in US')).to.eql(['ie 11']);
        });

        it('fixes country case', function () {
            expect(browserslist('> 10.2% in us')).to.eql(['ie 11']);
        });

        it('loads country from Can I Use', function () {
            expect(browserslist('> 1% in RU')).to.not.be.empty;
        });

    });

    describe('.parseConfig()', function () {

        it('parses queries', function () {
            expect(browserslist.parseConfig('ie 10\n> 1%'))
                .to.eql(['ie 10', '> 1%']);
        });

        it('trims whitespaces', function () {
            expect(browserslist.parseConfig('ie 10 \n \n  > 1%\n'))
                .to.eql(['ie 10', '> 1%']);
        });

        it('removes comments', function () {
            expect(browserslist.parseConfig('# support list\nie 10#bad\n> 1%'))
                .to.eql(['ie 10', '> 1%']);
        });

    });

    describe('.readConfig()', function () {

        it('returns false on no config', function () {
            expect(browserslist.readConfig(__dirname)).to.be.false;
        });

        it('reads config', function () {
            expect(browserslist.readConfig(config)).to.eql(['ie 11', 'ie 10']);
        });

    });

});
