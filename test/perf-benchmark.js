var browserslist = require('..');
var fs = require('fs');
var path = require('path');

var cases = [
    {
        file: path.join(__dirname, '/perf/one/app/css/hello.css'),
        n: 3000,
        exists: true
    },
    {
        file: path.join(__dirname, '/perf/two/app/js/hello.js'),
        n: 3000,
        exists: true
    },
    {
        file: path.join(__dirname, '/perf/three/app/js/hello.js'),
        n: 3000,
        exists: false
    }
];

cases.forEach(function (test) {
    if (!fs.existsSync(test.file)) {
        throw new Error('invalid test');
    }
    for (var i = 0; i < test.n; i++) {
        var result = browserslist.findConfig(test.file);
        if (!!result !== test.exists) {
            throw new Error('expected config to exist but it did not');
        }
    }
});
