#!/usr/bin/env node

var browserslist = require('..')
var fs = require('fs')
var path = require('path')

var cases = [
  {
    file: path.join(__dirname, 'one/app/css/hello.css'),
    n: 5000,
    exists: true
  },
  {
    file: path.join(__dirname, 'two/app/js/hello.js'),
    n: 5000,
    exists: true
  },
  {
    file: path.join(__dirname, 'three/app/js/hello.js'),
    n: 5000,
    exists: false
  }
]

cases.forEach(function (test) {
  if (!fs.existsSync(test.file)) {
    throw new Error('invalid test')
  }
  for (var i = 0; i < test.n; i++) {
    var result = browserslist.findConfig(test.file)
    if (!!result !== test.exists) {
      throw new Error('expected config to exist but it did not')
    }
  }
})
