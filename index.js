var agents = require('caniuse-db/data').agents;

var browserslist = function () {

    defaults: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],

    major: ['firefox', 'chrome',  'safari', 'ios_saf',
            'opera',   'android', 'ie',     'ie_mob'],

    aliases: {
        fx:             'firefox'
        ff:             'firefox'
        ios:            'ios_saf'
        explorer:       'ie'
        blackberry:     'bb'
        explorermobile: 'ie_mob'
        operamini:      'op_mini'
        operamobile:    'op_mob'
        chromeandroid:  'and_chr'
        firefoxandroid: 'and_ff'
    },

    queries: {

        lastVersions: {
            regexp: /^last (\d+) versions?$/i,
            select: function (versions) {
                //TODO
            }
        },

        lastByBrowser: {
            regexp: /^last (\d+) versions?$/i,
            select: function (versions) {
                //TODO
            }
        },

        globalStatistics: {
            regexp: /^> (\d+(\.\d+)?)%$/,
            select: function (popularity) {
                //TODO
            }
        },

        newerThan: {
            regexp: /^(\w+) (>=?)\s*([\d\.]+)/,
            select: function (browser, sign, version) {
                //TODO
            }
        },

        olderThan: {
            regexp: /^(\w+) (<=?)\s*([\d\.]+)/,
            select: function (browser, sign, version) {
                //TODO
            }
        },

        esr: {
            regexp: /^(firefox|ff|fx) esr$/i,
            select: function (versions) {
                return ['firefox 31'];
            }
        },

        direct: {
            regexp: /^(\w+) ([\d\.]+)$/,
            select: function (browser, version) {
                //TODO
            }
        }

    },

    // Return array of browsers by selection queries:
    //
    //   browserslist.get('IE >= 10, IE 8') //=> ['ie 11', 'ie 10', 'ie 8']
    get: function (selections) {
        if ( typeof(selections) == 'string' ) {
            selections = selections.split(/,\s*/)
        }
        //TODO
    }

};

module.exports = browserslist;
