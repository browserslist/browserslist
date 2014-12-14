var caniuse = require('caniuse-db/data').agents;

var uniq = function (array) {
    var filtered = [];
    for ( var i = 0; i < array.length; i++ ) {
        if ( filtered.indexOf(array[i]) == -1 ) filtered.push(array[i]);
    }
    return filtered;
};

var browserslist = {

    // Converted Can I Use data
    data: { },

    // Default browsers query
    defaults: ['last 2 versions', 'Firefox ESR', 'Opera 12.1'],

    // What browsers will be used in `last n version` query
    major: ['firefox', 'chrome',  'safari', 'ios_saf',
            'opera',   'android', 'ie',     'ie_mob'],

    // Browser names aliases
    aliases: {
        fx:             'firefox',
        ff:             'firefox',
        ios:            'ios_saf',
        explorer:       'ie',
        blackberry:     'bb',
        explorermobile: 'ie_mob',
        operamini:      'op_mini',
        operamobile:    'op_mob',
        chromeandroid:  'and_chr',
        firefoxandroid: 'and_ff'
    },

    // Return array of browsers by selection queries:
    //
    //   browserslist.get('IE >= 10, IE 8') //=> ['ie 11', 'ie 10', 'ie 8']
    get: function (selections) {
        var result = [];

        if ( typeof(selections) == 'undefined' ) {
            selections = browserslist.defaults;
        } else if ( typeof(selections) == 'string' ) {
            selections = selections.split(/,\s*/);
        }

        var query, match, array, used;
        selections.forEach(function (selection) {
            if ( selection.trim() === '' ) return;
            used = false;

            for ( var i in browserslist.queries ) {
                query = browserslist.queries[i];
                match = selection.match(query.regexp);
                if ( match ) {
                    array  = query.select.apply(browserslist, match.slice(1));
                    result = result.concat(array);
                    used   = true;
                    break;
                }
            }

            if ( !used ) {
                throw 'Unknown browser query `' + selection + '`';
            }
        });

        return uniq(result);
    },

    // Get browser data by alias or case insensitive name
    byName: function (name) {
        name = name.toLowerCase();
        name = browserslist.aliases[name] || name;

        var data = browserslist.data[name];
        if ( !data ) throw 'Unknown browser ' + name;
        return data;
    },

    queries: {

        lastVersions: {
            regexp: /^last (\d+) versions?$/i,
            select: function (versions) {
                var selected = [];
                browserslist.major.forEach(function (name) {
                    var data  = browserslist.byName(name);
                    var array = data.released.slice(-versions);

                    array = array.map(function (v) {
                        return data.name + ' ' + v;
                    });
                    selected = selected.concat(array);
                });
                return selected;
            }
        },

        lastByBrowser: {
            regexp: /^last (\d+) (\w+) versions?$/i,
            select: function (versions, name) {
                var data = browserslist.byName(name);
                return data.released.slice(-versions).map(function (v) {
                    return data.name + ' ' + v;
                });
            }
        },

        newerThan: {
            regexp: /^(\w+) (>=?)\s*([\d\.]+)/,
            select: function (name, sign, version) {
                var data = browserslist.byName(name);
                version  = parseFloat(version);

                var filter;
                if ( sign == '>' ) {
                    filter = function (v) {
                        return parseFloat(v) > version;
                    };
                } else {
                    filter = function (v) {
                        return parseFloat(v) >= version;
                    };
                }

                return data.released.filter(filter).map(function (v) {
                    return data.name + ' ' + v;
                });
            }
        },

        olderThan: {
            regexp: /^(\w+) (<=?)\s*([\d\.]+)/,
            select: function (name, sign, version) {
                var data = browserslist.byName(name);
                version  = parseFloat(version);

                var filter;
                if ( sign == '<' ) {
                    filter = function (v) {
                        return parseFloat(v) < version;
                    };
                } else {
                    filter = function (v) {
                        return parseFloat(v) <= version;
                    };
                }

                return data.released.filter(filter).map(function (v) {
                    return data.name + ' ' + v;
                });
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
            select: function (name, version) {
                var data = browserslist.byName(name);
                if ( data.versions.indexOf(version) == -1 ) {
                    throw 'Unknown version ' + version + ' of ' + name;
                }

                return [data.name + ' ' + version];
            }
        }

    }

};

var normalize = function (versions) {
    return versions
        .filter(function (version) {
            return typeof(version) == 'string';
        })
        .map(function (version) {
            return version.split('-')[0];
        });
};

for ( var name in caniuse ) {
    browserslist.data[name] = {
        name:     name,
        versions: normalize(caniuse[name].versions),
        released: normalize(caniuse[name].versions.slice(0, -3))
    };
}

module.exports = browserslist;
