var browserslist = require('../');
var expect       = require('chai').expect;

var origin = browserslist.data;

describe('browserslist', function () {

    afterEach(function () {
        browserslist.data = origin;
    });

    describe('.get()', function () {

        it('accepts array', function () {
            expect(browserslist.get(['ie 11', 'ie 10']))
                .to.eql(['ie 11', 'ie 10']);
        });

        it('accepts string', function () {
            expect(browserslist.get('ie 11, ie 10'))
                .to.eql(['ie 11', 'ie 10']);
        });

        it('returns unique array', function () {
            expect(browserslist.get('ie 10, ie 10')).to.eql(['ie 10']);
        });

        it('raises on unknow query', function () {
            expect(function () {
                browserslist.get('good');
            }).to.throw('Unknown browser query `good`');
        });

        describe('ESR query', function () {

            it('selects Firefox ESR', function () {
                expect(browserslist.get('Firefox ESR')).to.eql(['firefox 31']);
            });

            it('uses case insensitive aliases', function () {
                var result = browserslist.get('Firefox ESR');
                expect(browserslist.get('firefox esr')).to.eql(result);
                expect(browserslist.get('ff esr')).to.eql(result);
                expect(browserslist.get('fx esr')).to.eql(result);
            });

        });

        describe('direct query', function () {

            it('selects browser by name', function () {
                expect(browserslist.get('ie 10')).to.eql(['ie 10']);
            });

            it('uses case insensitive aliases', function () {
                var result = browserslist.get('ie 10');
                expect(browserslist.get('Explorer 10')).to.eql(result);
                expect(browserslist.get('IE 10')).to.eql(result);
            });

            it('raises on unknown name', function () {
                expect(function () {
                    browserslist.get('unknow 10');
                }).to.throw('Unknown browser unknow');
            });

            it('raises on unknown version', function () {
                expect(function () {
                    browserslist.get('IE 1');
                }).to.throw('Unknown version 1 of IE');
            });

        });

        describe('never than query', function () {

            beforeEach(function () {
                browserslist.data = {
                    ie: {
                        name:      'ie',
                        released: ['9', '10', '11'],
                        versions: ['9', '10', '11', '12']
                    }
                };
            });

            it('selects browser by more sign', function () {
                expect(browserslist.get('ie > 9')).to.eql(['ie 10', 'ie 11']);
            });

            it('selects browser by more or equal sign', function () {
                expect(browserslist.get('ie >= 10')).to.eql(['ie 10', 'ie 11']);
            });

            it('uses case insensitive aliases', function () {
                expect(browserslist.get('Explorer > 10')).to.eql(['ie 11']);
            });

            it('raises on unknown browser', function () {
                expect(function () {
                    browserslist.get('unknow > 10');
                }).to.throw('Unknown browser unknow');
            });

        });

        describe('older than query', function () {

            it('selects browser by less sign', function () {
                expect(browserslist.get('ie < 7')).to.eql(['ie 5.5', 'ie 6']);
            });

            it('selects browser by less or equal sign', function () {
                expect(browserslist.get('ie <= 6')).to.eql(['ie 5.5', 'ie 6']);
            });

            it('uses case insensitive aliases', function () {
                expect(browserslist.get('Explorer < 6')).to.eql(['ie 5.5']);
            });

            it('raises on unknown browser', function () {
                expect(function () {
                    browserslist.get('unknow < 10');
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
                expect(browserslist.get('last 2 versions'))
                    .to.eql(['chrome 38', 'chrome 39', 'ie 10', 'ie 11']);
            });

            it('supports pluralization', function () {
                expect(browserslist.get('last 1 version'))
                    .to.eql(['chrome 39', 'ie 11']);
            });

            it('is case insensitive', function () {
                expect(browserslist.get('Last 01 Version'))
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
                expect(browserslist.get('last 2 ie versions'))
                    .to.eql(['ie 10', 'ie 11']);
            });

            it('supports pluralization', function () {
                expect(browserslist.get('last 1 ie version'))
                    .to.eql(['ie 11']);
            });

            it('has case insensitive aliases', function () {
                expect(browserslist.get('Last 01 Explorer Version'))
                    .to.eql(['ie 11']);
            });

        });

    });

});
