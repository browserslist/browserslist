var caniuse = require('caniuse-db/data').agents;

var agents = { };
for ( var name in caniuse ) {
    agents[name] = {
        name:     name,
        versions: caniuse[name].versions.map(function (version) {
            if ( typeof(version) == 'string' ) {
                return version.split('-')[0];
            } else {
                return version;
            }
        })
    };
}

var uniq = function (array) {
    var filtered = [];
    for ( var i = 0; i < array.length; i++ ) {
        if ( filtered.indexOf(array[i]) == -1 ) filtered.push(array[i]);
    }
    return filtered;
};

var byName = function (name) {
    name = name.toLowerCase();
    name = browserslist.aliases[name] || name;

    var data = agents[name];
    if ( !data ) throw 'Unknown browser ' + name;
    return data;
};

var browserslist = {

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

    queries: {

        esr: {
            regexp: /^(firefox|ff|fx) esr$/i,
            select: function (versions) {
                return ['firefox 31'];
            }
        },

        direct: {
            regexp: /^(\w+) ([\d\.]+)$/,
            select: function (name, version) {
                var data = byName(name);
                if ( data.versions.indexOf(version) == -1 ) {
                    throw 'Unknown version ' + version + ' of ' + name;
                }

                return [data.name + ' ' + version];
            }
        }

    },

    // Return array of browsers by selection queries:
    //
    //   browserslist.get('IE >= 10, IE 8') //=> ['ie 11', 'ie 10', 'ie 8']
    get: function (selections) {
        var result = [];

        if ( typeof(selections) == 'string' ) {
            selections = selections.split(/,\s*/);
        }

        var query, match, array, used;
        selections.forEach(function (selection) {
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
                throw 'Unknown browser query ' + selection;
            }
        });

        return uniq(result);
    }

};

module.exports = browserslist;
