var browserslist = require('../');
var expect       = require('chai').expect;

var originData  = browserslist.data;
var originUsage = browserslist.usage;

describe('browserslist()', function () {

    afterEach(function () {
        browserslist.data  = originData;
        browserslist.usage = originUsage;
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

    it('has default selection', function () {
        expect(browserslist.defaults.length).to.be.at.least(1);
    });

    it('use default selection on empty request', function () {
        expect(browserslist())
            .to.eql(browserslist(browserslist.defaults));
    });

    it('raises on unknow query', function () {
        expect(function () {
            browserslist('good');
        }).to.throw('Unknown browser query `good`');
    });

    it('use latest version when Can I Use join it', function () {
        expect(function () {
            browserslist('iOS 7.0');
        }).to.throw('Unknown version 7.0 of iOS');
        expect(function () {
            browserslist('iOS 7.1');
        }).not.to.throw();
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
            expect(browserslist('ie > 9')).to.eql(['ie 10', 'ie 11']);
        });

        it('selects browser by more or equal sign', function () {
            expect(browserslist('ie >= 10')).to.eql(['ie 10', 'ie 11']);
        });

        it('selects browser by less sign', function () {
            expect(browserslist('ie < 10')).to.eql(['ie 8', 'ie 9']);
        });

        it('selects browser by less or equal sign', function () {
            expect(browserslist('ie <= 9')).to.eql(['ie 8', 'ie 9']);
        });

        it('uses case insensitive aliases', function () {
            expect(browserslist('Explorer > 10')).to.eql(['ie 11']);
        });

        it('raises on unknown browser', function () {
            expect(function () {
                browserslist('unknow > 10');
            }).to.throw('Unknown browser unknow');
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
                ios_saf: {
                    released: []
                },
                opera: {
                    released: []
                },
                android: {
                    released: []
                },
                ie_mob: {
                    released: []
                }
            };
        });

        it('selects versions of each major browser', function () {
            expect(browserslist('last 2 versions'))
                .to.eql(['chrome 38', 'chrome 39', 'ie 10', 'ie 11']);
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
                .to.eql(['ie 10', 'ie 11']);
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
            expect(browserslist('> 10%')).to.eql(['ie 10', 'ie 11']);
        });

        it('works with float', function () {
            expect(browserslist('> 10.2%')).to.eql(['ie 11']);
        });
    });

});
